import ProfileUpdateForm from '@/components/user/ProfileUpdateForm';
import { createClient } from '@/utils/supabase/server';
import React from 'react'

const MyProfile = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <ProfileUpdateForm user={user} />
    </div>
  )
}

export default MyProfile;