'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseConfigured, getFirebase } from '@/lib/firebase';
import { MessageCircle, UserPlus } from 'lucide-react';
import styles from './public.module.css';

type Profile={username:string;displayName:string;bio:string;photoURL:string;followersCount:number;followingCount:number};
const tabs=['Wall','Collections','Recent study','Stats'];

export default function PublicProfile({params}:{params:Promise<{username:string}>}){
 const [profile,setProfile]=useState<Profile|null>(null);const [error,setError]=useState('');const [loading,setLoading]=useState(true);
 useEffect(()=>{params.then(async p=>{const clean=p.username.toLowerCase();if(!firebaseConfigured()){setError('Profile database is not configured yet.');setLoading(false);return;}try{const {db}=getFirebase();const nameSnap=await getDoc(doc(db,'usernames',clean));if(!nameSnap.exists()){setError('This profile does not exist.');return;}const userSnap=await getDoc(doc(db,'users',nameSnap.data().uid));if(!userSnap.exists()){setError('This profile does not exist.');return;}setProfile(userSnap.data() as Profile);}catch(e){setError(e instanceof Error?e.message:'Could not load profile.');}finally{setLoading(false);}})},[params]);
 if(loading)return <main className={styles.page}><div className={styles.loading}>Loading profile…</div></main>;
 if(error||!profile)return <main className={styles.page}><div className={styles.missing}><span>✦</span><h1>{error||'Profile not found.'}</h1><a href="/">Back to STUKO</a></div></main>;
 return <main className={styles.page}><div className={styles.wrap}><header className={styles.top}><a href="/" className={styles.brand}>STUKO</a><div className={styles.actions}><button className={styles.follow}><UserPlus size={14}/> Follow</button><button className={styles.wallBtn}><MessageCircle size={14}/> Wall</button></div></header><section className={styles.hero}><div className={styles.avatar}>{profile.photoURL?<img src={profile.photoURL} alt=""/>:profile.displayName?.[0]?.toUpperCase()||'S'}</div><div className={styles.identity}><h1>{profile.displayName}<span>✦</span></h1><p className={styles.handle}>@{profile.username}</p><p className={styles.bio}>{profile.bio||'No bio yet.'}</p><div className={styles.stats}><span><b>{profile.followersCount||0}</b> followers</span><span><b>{profile.followingCount||0}</b> following</span></div></div></section><nav className={styles.menu}>{tabs.map((tab,i)=><button key={tab} className={i===0?'active':''}>{tab}</button>)}</nav><section className={styles.wall}><div className={styles.wallHead}><div><p>PUBLIC WALL</p><h2>Wall</h2><span>Leave a little note for @{profile.username}.</span></div><MessageCircle size={19}/></div><div className={styles.empty}><div>♡</div><h3>No notes yet.</h3><p>Be the first person to leave something nice.</p><button>Write on wall</button></div></section><footer className={styles.footer}>STUKO · study, but make it yours.</footer></div></main>;
}
