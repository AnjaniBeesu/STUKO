'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseConfigured, getFirebase } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

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
 return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',fontFamily:'Arial,sans-serif',color:'#151515'}}>Opening your public profile…</main>;
}
