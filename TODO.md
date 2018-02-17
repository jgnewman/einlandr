- [ ] Create a tool for abstracting data calls on frontend. For example,
class Users extends REST {
  constructor(token) {
    super(token);
  }

  getAdults()
}

const users = new Users('asdfasdf').base('/api/v1/users')
await users.get(id)
