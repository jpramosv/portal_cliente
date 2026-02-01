import { signout } from '@/app/actions/auth'
import MainLayoutClient from './MainLayoutClient'

export default function DashboardLayout({ children }) {
    return (
        <MainLayoutClient signoutAction={signout}>
            {children}
        </MainLayoutClient>
    )
}
