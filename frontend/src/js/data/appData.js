import axios from 'axios';
import brightsocket from 'brightsocket.io-client';
import { APP } from '../lib/constants';

export function foo(sessionId, userId, userData) {

}

// EXAMPLE
// Authenticate via ajax, returning a promise
//
// export function ajaxAuth(credentials) {
//   return axios.post('/api/vi/authentication', credentials);
// }


// EXAMPLE
// Make an ajax post using a session id token, returning a promise
//
// export function createUser(sessionId, userData) {
//   return axios.post(
//     '/api/v1/users',
//     userData,
//     { headers: { Authorization: `Basic ${sessionId}` } }
//   );
// }

// EXAMPLE
// Authenticate via websocket, returning a promise
// const socket = brightsocket();
//
// export function socketAuth(credentials) {
//   return new Promise((resolve, reject) => {
//     socket.connect('AUTHENTICATION', credentials, () => {
//       socket.receive('AUTHENTICATED', data => {
//         socket.connect('AUTHENTICATED', data, () => resolve(data))
//       });
//       socket.receive('UNAUTHORIZED', () => reject());
//     });
//   });
// }
//
// After authenticating, all of your messages passed to the socket
// should contain a sessionId property as returned in the authentication data.
