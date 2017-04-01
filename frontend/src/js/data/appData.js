import axios from 'axios';
import brightsocket from 'brightsocket.io-client';
import { APP } from '../lib/constants';

export function foo(sessionId, userId, userData) {
  // An axios GET request with authorization.
  // Returns a promise.
  //
  // return axios.get(`/api/v1/users/${userId}`, {
  //   headers: { Authorization: `Basic ${sessionId}` }
  // });

  // An axios POST request with authorization.
  // Returns a promise.
  //
  // return axios.post(
  //   '/api/v1/users/',
  //   userData,
  //   { headers: { Authorization: `Basic ${sessionId}` } }
  // );

  // Connect to a socket with authorization.
  // Requires a corresponding 'MY_CHANNEL' socket handler on the server side.
  //
  // const socket = brightsocket();
  // socket.connect('MY_CHANNEL', { sessionId: sessionId }, () => {
  //   socket.receive('EVENT_1', result => console.log(result));
  //   socket.send('EVENT_2', userData);
  // });
}
