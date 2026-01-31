'use server'

const CHATWOOT_API_URL = process.env.CHATWOOT_API_URL
const CHATWOOT_API_ACCESS_TOKEN = process.env.CHATWOOT_API_ACCESS_TOKEN
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID || '1'

// Remove trailing slash if present
const BASE_URL = CHATWOOT_API_URL?.replace(/\/+$/, '')

async function getContactByEmail(email) {
    if (!BASE_URL || !CHATWOOT_API_ACCESS_TOKEN) {
        console.error('Chatwoot env vars missing')
        return null
    }

    console.log(`Searching Chatwoot for contact with email: ${email}`)

    try {
        const url = `${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts/search?q=${email}`
        console.log(`Chatwoot API Request: ${url}`)

        const response = await fetch(url, {
            headers: {
                'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            console.error(`Chatwoot API error: ${response.status} ${response.statusText}`)
            throw new Error(`Chatwoot API error: ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`Chatwoot Search Result:`, JSON.stringify(data, null, 2))

        return data.payload && data.payload.length > 0 ? data.payload[0] : null

    } catch (error) {
        console.error('Error fetching contact:', error)
        return null
    }
}

async function createContact(email) {
    if (!BASE_URL || !CHATWOOT_API_ACCESS_TOKEN) return null

    console.log(`Creating Chatwoot contact for: ${email}`)

    try {
        const name = email.split('@')[0] // Use email prefix as name
        const response = await fetch(`${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts`, {
            method: 'POST',
            headers: {
                'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, name })
        })

        if (!response.ok) {
            console.error('Failed to create contact:', await response.text())
            // If email already exists (edge case race condition), try search again? 
            // For now, just return null
            return null
        }

        const data = await response.json()
        return data.payload.contact
    } catch (error) {
        console.error('Error creating contact:', error)
        return null
    }
}

export async function getConversations(email) {
    let contact = await getContactByEmail(email)

    if (!contact) {
        console.log('Contact not found, attempting to create one...')
        contact = await createContact(email)
    }

    if (!contact) return { error: 'Contact not found or Chatwoot unavailable' }

    try {
        const response = await fetch(`${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts/${contact.id}/conversations`, {
            headers: {
                'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            next: { revalidate: 0 }
        })

        if (!response.ok) throw new Error('Failed to fetch conversations')

        const data = await response.json()
        return { conversations: data.payload || [] }

    } catch (error) {
        console.error('Error getting conversations:', error)
        return { error: error.message }
    }
}

export async function getMessages(conversationId) {
    if (!conversationId) return { error: 'Invalid conversation ID' }

    try {
        const url = `${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`
        const response = await fetch(url, {
            headers: {
                'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            next: { revalidate: 0 }
        })

        if (!response.ok) {
            // Handle 404 specifically to avoid console noise for invalid IDs
            if (response.status === 404) {
                return { error: 'Conversa não encontrada (404)', messages: [] }
            }

            const errorText = await response.text()
            console.error(`Chatwoot API error [getMessages]: ${response.status} ${response.statusText} - ${errorText}`)
            throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        return { messages: data.payload || [] }

    } catch (error) {
        // Don't log expected 404s if they were thrown (though we handle above now)
        if (!error.message.includes('404')) {
            console.error('Error getting messages:', error)
        }
        return { error: error.message }
    }
}

export async function getAllConversations(inboxId = null) {
    if (!BASE_URL || !CHATWOOT_API_ACCESS_TOKEN) return { error: 'Chatwoot env vars missing' }

    try {
        let url = `${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations`
        if (inboxId) {
            url += `?inbox_id=${inboxId}`
        }

        const response = await fetch(url, {
            headers: {
                'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            next: { revalidate: 0 }
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`Chatwoot API error [getAllConversations]: ${response.status} ${response.statusText} - ${errorText}`)
            throw new Error(`Failed to fetch all conversations: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        const conversations = (data.data.payload || []).map(conv => ({
            id: conv.id,
            status: conv.status,
            last_activity_at: conv.last_activity_at,
            inbox_id: conv.inbox_id,
            labels: conv.labels || [], // Include labels
            contact: conv.meta?.sender || { name: 'Desconhecido' },
            last_message: conv.last_non_activity_message?.content
        }))

        return { conversations }

    } catch (error) {
        console.error('Error getting all conversations:', error)
        return { error: error.message }
    }
}

export async function getInboxes() {
    if (!BASE_URL || !CHATWOOT_API_ACCESS_TOKEN) return { error: 'Chatwoot env vars missing' }

    try {
        const response = await fetch(`${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/inboxes`, {
            headers: {
                'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!response.ok) throw new Error('Failed to fetch inboxes')

        const data = await response.json()
        return { inboxes: data.payload || [] }

    } catch (error) {
        console.error('Error getting inboxes:', error)
        return { error: error.message }
    }
}

export async function sendMessage(conversationId, content) {
    if (!BASE_URL || !CHATWOOT_API_ACCESS_TOKEN) return { error: 'Chatwoot env vars missing' }

    try {
        const response = await fetch(`${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: {
                'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content,
                message_type: 'outgoing', // 'outgoing' means sent by agent/admin
                private: false
            })
        })

        if (!response.ok) throw new Error('Failed to send message')

        const data = await response.json()
        return { message: data }

    } catch (error) {
        console.error('Error sending message:', error)
        return { error: error.message }
    }
}

export async function sendMessageWithAttachment(conversationId, content, file) {
    if (!BASE_URL || !CHATWOOT_API_ACCESS_TOKEN) return { error: 'Chatwoot env vars missing' }

    try {
        const formData = new FormData()
        formData.append('content', content)
        formData.append('message_type', 'outgoing')
        formData.append('private', 'false')
        formData.append('attachments[]', file)

        const response = await fetch(`${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: {
                'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
                // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
            },
            body: formData
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Failed to send message with attachment:', errorText)
            throw new Error('Failed to send message with attachment')
        }

        const data = await response.json()
        return { message: data }

    } catch (error) {
        console.error('Error sending message with attachment:', error)
        return { error: error.message }
    }
}

export async function getContacts(page = 1) {
    if (!BASE_URL || !CHATWOOT_API_ACCESS_TOKEN) return { error: 'Chatwoot env vars missing' }

    try {
        const response = await fetch(`${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/contacts?page=${page}&sort=-last_activity_at`, {
            headers: {
                'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            next: { revalidate: 60 }
        })

        if (!response.ok) throw new Error('Failed to fetch contacts')

        const data = await response.json()
        return {
            contacts: data.payload || [],
            meta: data.meta
        }

    } catch (error) {
        console.error('Error getting contacts:', error)
        return { error: error.message }
    }
}

export async function getDashboardMetrics() {
    // Parallel fetch for efficiency
    const [contactsRes, conversationsRes] = await Promise.all([
        getContacts(1),
        getAllConversations()
    ])

    const totalContacts = contactsRes.meta?.count || 0
    const conversations = conversationsRes.conversations || []

    const openConversations = conversations.filter(c => c.status === 'open').length
    const totalConversations = conversations.length
    // Assuming 'resolved' or 'snoozed' status implies closed/inactive
    const closedConversations = totalConversations - openConversations

    return {
        totalContacts,
        totalConversations,
        openConversations,
        closedConversations,
        recentConversations: conversations.slice(0, 5) // Last 5 conversations
    }
}

export async function updateConversationStatus(conversationId, status) {
    if (!BASE_URL || !CHATWOOT_API_ACCESS_TOKEN) return { error: 'Chatwoot env vars missing' }

    const validStatuses = ['open', 'resolved', 'pending', 'snoozed']
    if (!validStatuses.includes(status)) return { error: 'Invalid status' }

    try {
        const response = await fetch(`${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/toggle_status`, {
            method: 'POST',
            headers: {
                'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        })

        if (!response.ok) throw new Error('Failed to update status')

        const data = await response.json()
        return { success: true, payload: data.payload }

    } catch (error) {
        console.error('Error updating status:', error)
        return { error: error.message }
    }
}
export async function getAllLabels() {
    if (!BASE_URL || !CHATWOOT_API_ACCESS_TOKEN) return { error: 'Chatwoot env vars missing' }

    try {
        const response = await fetch(`${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/labels`, {
            headers: {
                'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            next: { revalidate: 0 }
        })

        if (!response.ok) throw new Error('Failed to fetch labels')

        const data = await response.json()
        return { labels: data.payload || [] }

    } catch (error) {
        console.error('Error getting labels:', error)
        return { error: error.message }
    }
}

export async function getConversationLabels(conversationId) {
    if (!BASE_URL || !CHATWOOT_API_ACCESS_TOKEN) return { error: 'Chatwoot env vars missing' }

    try {
        const response = await fetch(`${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/labels`, {
            headers: {
                'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            next: { revalidate: 0 }
        })

        if (!response.ok) throw new Error('Failed to fetch conversation labels')

        const data = await response.json()
        return { labels: data.payload || [] }

    } catch (error) {
        console.error('Error getting conversation labels:', error)
        return { error: error.message }
    }
}

export async function addConversationLabels(conversationId, labels) {
    if (!BASE_URL || !CHATWOOT_API_ACCESS_TOKEN) return { error: 'Chatwoot env vars missing' }

    try {
        const response = await fetch(`${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/labels`, {
            method: 'POST',
            headers: {
                'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ labels })
        })

        if (!response.ok) throw new Error('Failed to add labels')

        const data = await response.json()
        return { labels: data.payload || [] }

    } catch (error) {
        console.error('Error adding labels:', error)
        return { error: error.message }
    }
}

export async function removeConversationLabel(conversationId, label) {
    // Chatwoot API for removing a label usually involves getting current labels, filtering, and setting them again, 
    // OR creating a specific DELETE request if the API supports individual label removal (it often doesn't directly, 
    // but the /labels endpoint usually sets the whole list).
    // Let's retry checking standard Chatwoot API: usually POST to /labels adds, but is there a delete?
    // Actually, Chatwoot v1 often allows managing labels via POST with the full list.
    // However, some versions might have DELETE /api/v1/accounts/{account_id}/conversations/{conversation_id}/labels/{label}
    // Let's assume standard behavior: fetch, remove, update OR try DELETE if supported.
    // Based on docs, it supports DELETE /conversations/:id/labels/:label

    if (!BASE_URL || !CHATWOOT_API_ACCESS_TOKEN) return { error: 'Chatwoot env vars missing' }

    try {
        // We will try DELETE method with the label as query param or part of URL depending on implementation.
        // Usually it is DELETE .../labels?labels[]=label_name or similar, OR passing as list in body?
        // Actually best bet is encoding the label in the URL if the API supports it, 
        // OR simply using the POST endpoint with the updated list if DELETE isn't straightforward.
        // Let's try the DELETE endpoint first which is cleaner if it works.
        // Note: encoding label is important.

        // Wait, standard Chatwoot API documented endpoint for removing a label from conversation is:
        // DELETE /api/v1/accounts/:account_id/conversations/:conversation_id/labels
        // Body: { labels: ['label_name'] } - Removes specified labels.

        const response = await fetch(`${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/labels/remove`, {
            method: 'POST', // Some internal APIs use a specific action, or just standard DELETE?
            // Actually, let's use the safest approach: Get current -> Filter -> Set new list.
            // Oh wait, looking at typical integrations, Chatwoot allows adding/removing via POST to .../labels with labels: [...] which ADDS.
            // To REMOVE, usually one has to pass the new Full List?? 
            // NO, Chatwoot API v1 has a DELETE endpoint that accepts `labels` in the body or as query params?
            // Let's try sending a DELETE request with the label in the body.
        });

        // Let's try a safer route: DELETE with generic endpoint and body.
        const deleteResponse = await fetch(`${BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/labels`, {
            method: 'DELETE',
            headers: {
                'api_access_token': CHATWOOT_API_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ labels: [label] })
        });

        if (!deleteResponse.ok) {
            // If DELETE fails, maybe it expects the label in the URL?
            console.warn('DELETE label failed, trying alternate method...')
            throw new Error('Failed to remove label')
        }

        const data = await deleteResponse.json()
        return { isSuccess: true, payload: data.payload }

    } catch (error) {
        console.error('Error removing label:', error)
        return { error: error.message }
    }
}
