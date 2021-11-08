import { User } from './user.entity';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { Test } from '@nestjs/testing';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;
  beforeEach(async () => {
      const users: User[] = [];
    //create a fake copy of users service
    fakeUsersService = {
      //partial: type heper
      
      find: (email: string) => {
        const filteredUsers = users.filter(user => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) =>{
          const user = {id: Math.random() * 999999, email, password} as User
          users.push(user);
          return Promise.resolve(user);
      }
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hashed password', async () => {
    const user = await service.signup('asdad@gmail.com', '1212131');
    expect(user.password).not.toEqual('asdad');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async (done) => {
    // fakeUsersService.find = () =>
    //   Promise.resolve([{ id: 1, email: 'a', password: '1' } as User]);
    await service.signup('asdf@asdf.com','asdf');
    try {
      await service.signup('asdf@asdf.com', 'asdf');
    } catch (err) {
      done();
    }
  });

  it('throws if signin is called with an unused email', async (done) => {
    try {
      await service.signin('asdf@asdf.com', 'asdf');
    } catch (err) {
      done();
    }
  });

  it('throws if an invalid password is provied', async (done) => {
    // fakeUsersService.find = () =>
    //   Promise.resolve([
    //     { email: 'asdf@asdf.com', password: 'asdf' } as User,
    //   ]);
    await service.signup('asdf@asdf.com','password');
    try {
      await service.signin('asdf@asdf.com', '1212');
    } catch (error) {
      done();
    }
  });

  it('returns a user if correct password is provided', async (done) => {
    // fakeUsersService.find = () =>
    //   Promise.resolve([
    //     {
    //       email: 'dasd@gmail.com',
    //       password:
    //         '991fd4e5e07f3f3a.4dadf6901157637735524ada80fd6d955920eb75cd470c2ca8bfe45e1a24a721',
    //     } as User,
    //   ]);

    await service.signup('dasd@gmail.com', '32213123');
    const user = await service.signin('dasd@gmail.com', '32213123');
    expect(user).toBeDefined();
    // const user = await service.signup('sdasd@gmail.com', 'mypassword');
    // console.log(user);
  });
});
