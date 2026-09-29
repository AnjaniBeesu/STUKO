'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseConfigured, getFirebase } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import SiteChrome from '@/app/components/SiteChrome';

export default function ProfilePage(){
 const router=useRouter();
 useEffect(()=>{
  if(!firebaseConfigured()){return;}
  const {auth,db}=getFirebase();
  return onAuthStateChanged(auth,async user=>{
   if(!user){router.replace('/auth');return;}
   const snap=await getDoc(doc(db,'users',user.uid));
   const username=snap.exists()?snap.data().username:'';
   if(username) router.replace(`/u/${username}`); else router.replace('/onboarding');
  });
 },[router]);
 return <SiteChrome><main style={{minHeight:'calc(100svh - 140px)',display:'grid',placeItems:'center',fontFamily:'Arial,sans-serif',color:'var(--page-text)'}}>Opening your public profile…</main></SiteChrome>;
}
