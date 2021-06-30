
import './App.css';
import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth';
import {useAuthState} from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import React, { useEffect, useState,useRef } from "react";
require('firebase/auth');

firebase.initializeApp({
    apiKey: "AIzaSyDwXF0eBSHWBibw_3k_t79hAf7hW4Yur04",
    authDomain: "reactchato.firebaseapp.com",
    projectId: "reactchato",
    storageBucket: "reactchato.appspot.com",
    messagingSenderId: "622355683911",
    appId: "1:622355683911:web:00c4a08420fe3ca61c6f62",
    measurementId: "G-ET4XL3XXC7"

})

const auth=firebase.auth();
const firestore=firebase.firestore();
const analytics = firebase.analytics();

function App() {
  const [user]=useAuthState(auth);
  return (
    <div className="App">
      <header className="App-header">
        {/* <SignOut/> */}
       </header>
      <section>

        {user ? <ChatRoom/> : <SignIn/>}

      </section>
    </div>
  );
}

function SignIn(){
  const signInWithGoogle=()=>{
    const provider=new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <>
    <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      
    </>
  )

}

function SignOut(){
   return auth.currentUser && (
     <button className='sign-out' onClick={()=>auth.SignOut()}>Sign Out</button>
   )
}

function ChatRoom(){
  const dummy=useRef();
  const messageRef=firestore.collection('messages');
  const query=messageRef.orderBy('createdAt').limit(25);
  const [messages]=useCollectionData(query,{idField:'id'});
  const [formValue,setFormValue]=useState('');
  const sendMessage=async(e)=>{
    e.preventDefault();
    const {uid,photoURL}=auth.currentUser;
    await messageRef.add({
      text:formValue,
      createdAt:firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');
    dummy.current.scrollIntoView({behavior:'smooth'})
  }
  return(
    <>
      <main>
        {messages && messages.map(msg=><ChatMessage key={msg.id} message={msg}/>)}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e)=>setFormValue(e.target.value)} placeholder="Enter your message here"/>
        <button type="submit" disabled={!formValue}>Send</button> 

      </form>


    </>
  )

}

function ChatMessage(props){
  const {text,uid,photoURL}=props.message;
  const messageClass=uid===auth.currentUser.uid?'sent':'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}

export default App;
