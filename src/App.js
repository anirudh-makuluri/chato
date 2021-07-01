
import './App.css';
import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth';
import {useAuthState} from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import React, { useEffect, useState,useRef } from "react";
require('firebase/auth');

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyDwXF0eBSHWBibw_3k_t79hAf7hW4Yur04",
    authDomain: "reactchato.firebaseapp.com",
    projectId: "reactchato",
    storageBucket: "reactchato.appspot.com",
    messagingSenderId: "622355683911",
    appId: "1:622355683911:web:72107c6e37cd14241c6f62",
    measurementId: "G-VQ94FB3P3C"
  
  })
  ;
}else {
  firebase.app(); // if already initialized, use that one
}



const auth=firebase.auth();
const firestore=firebase.firestore();
const analytics = firebase.analytics();
let messageRef=firestore.collection('messages');

function App() {
  const [user]=useAuthState(auth);
  return (
    <div className="App">
      <header className="App-header">
      <h1>😃📄</h1>
        <ChangeRoom/>
        <SignOut/>
       </header>
      <section>
        

        {user ? <ChatRoom/> : <SignIn/>}

      </section>
    </div>
  );
}

function ChangeRoom(){
  let [roomValue,setroomValue]=useState('');

  const chroom=async(e)=>{
    e.preventDefault();
    //console.log(formValue)
    if(roomValue==null) roomValue="messages"
    messageRef=firestore.collection(roomValue);

  }
  // setFormValue('');
  return auth.currentUser &&(
    <>
    <form onSubmit={chroom} className="roomform">
        <input className="roominput" value={roomValue} onChange={(e)=>setroomValue(e.target.value)} placeholder="enter room number"/>
        <button className="roombtn" disabled={!roomValue}>Submit</button>
      </form>
    </>
  )

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
     <button className='sign-out' onClick={()=>firebase.auth().signOut()}>Sign Out</button>
   )
}

function ChatRoom(){
  const dummy=useRef();
  const query=messageRef.orderBy('createdAt');
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
      <form onSubmit={sendMessage} className="messageform">
        <input className="messageinput" value={formValue} onChange={(e)=>setFormValue(e.target.value)} placeholder="Enter your message here"/>
        <button className="messagebtn" type="submit" disabled={!formValue}>►</button> 

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
