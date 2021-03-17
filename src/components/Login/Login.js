import React, { useContext, useState } from 'react';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import {userContext} from '../../App';
import { useHistory, useLocation } from 'react-router';


const Login = () => {
    const [loggedInUser, setLoggedInUser] = useContext(userContext);
    const [user, setUser] = useState({
        email: '',
        password: '',
        name: '',
        error: '',
        success: ''
    });
    const [newUser, setNewUser] = useState(false);

    let history = useHistory();
    let location = useLocation();
    let { from } = location.state || { from: { pathname: "/" } };

    if(firebase.apps.length === 0){
        firebase.initializeApp(firebaseConfig);
    }

    const handleGoogleSignIn = () => {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
            var credential = result.credential;
            var token = credential.accessToken;
            const {displayName, email} = result.user;
            const signedInUser = {name: displayName, email};
            setLoggedInUser(signedInUser);
            history.replace(from);

        }).catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            var email = error.email;
            var credential = error.credential;
            // ...
        });
    }

    const handleBlur = (e) => {
        let isFieldValid = true;
        if(e.target.name === 'email'){
            isFieldValid = /\S+@\S+\.\S+/.test(e.target.value); 
        }
        if(e.target.name === 'password'){
            isFieldValid = e.target.value.length > 6; 
        }
        if(isFieldValid){
            const newUserInfo = {...user};
            newUserInfo[e.target.name] = e.target.value;
            setUser(newUserInfo);
            setLoggedInUser(newUserInfo);
        }
    };

    const handleEmailPasswordSignIn = (e) => {
        if( newUser && loggedInUser.email && loggedInUser.password){
            firebase.auth().createUserWithEmailAndPassword(loggedInUser.email, loggedInUser.password)
                .then((userCredential) => {
                    var user = userCredential.user;
                    const newUserInfo = {...user};
                    newUserInfo.success = 'user created successfully';
                    setUser(newUserInfo);
                    setLoggedInUser(newUserInfo);
                    updateUserName(user.name);
                    history.replace(from);
                })
                .catch((error) => {
                    var errorMessage = error.message;
                    const newUserInfo = {...user};
                    newUserInfo.error = errorMessage;
                    setUser(newUserInfo);
                    setLoggedInUser(newUserInfo);
                });
        }

        if(!newUser && loggedInUser.email && loggedInUser.password){
            firebase.auth().signInWithEmailAndPassword(loggedInUser.email, loggedInUser.password)
            .then((userCredential) => {
                var user = userCredential.user;
                const newUserInfo = {...user};
                newUserInfo.success = 'user logged in successfully';
                setUser(newUserInfo);
                setLoggedInUser(newUserInfo);
                console.log(user);
                history.replace(from);
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode, errorMessage);
            });
        }
        e.preventDefault();
    };

    const updateUserName = name => {
        const user = firebase.auth().currentUser;

        user.updateProfile({
        displayName: name
        }).then(function(res) {
        console.log('user name updated', res);
        }).catch(function(error) {
        console.log('error');
        });
    }
    
    return (
        <div style={{textAlign: 'center'}}>
            <button onClick={handleGoogleSignIn}>sign in with google</button>
            <br/><br/>
            <p>email: {loggedInUser.email}</p>
            <p>password: {loggedInUser.password}</p>
            <form onSubmit={handleEmailPasswordSignIn}>
                <input onChange={() => setNewUser(!newUser)} type="checkbox" name="newUser" id=""/>
                <label htmlFor="newUser">click to sign up</label>
                <br/>

                { newUser && <input type="text" name="name" id="" placeholder="enter your name"/>}
                <br/>

                <input type="text" onBlur={handleBlur} name="email" id="" placeholder="your email"/>
                <br/>

                <input type="password" onBlur={handleBlur} name="password" id="" placeholder="your password"/>
                <br/>

                <input type="submit" value={newUser ? "sign up" : "sign in"}/>
            </form>
            <p style={{color: 'green'}}>{user.success}</p>
            <p style={{color: 'red'}}>{user.error}</p>
        </div>
    );
};

export default Login;