import UserSidebar from '@/components/user/UserSidebar'
import React from 'react'

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="container mx-auto px-4">
      <div className="min-h-full flex gap-5 my-8">
        {/* User Sidebar */}
        <UserSidebar />
        {/* Main Content Area */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

export default UserLayout