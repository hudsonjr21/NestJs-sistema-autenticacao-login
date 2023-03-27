import { UserToken } from './models/UserToken';
import { UserPayload } from './models/UserPayload';
import { UserService } from './../user/user.service';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UnauthorizedError } from './errors/unauthorized.error';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        ) {}

    login(user: User) : UserToken {
        // transforma o user em um JWT
        const payload: UserPayload = {
            sub: user.id,
            email: user.email,
            name: user.name,
          };

          const jwtToken = this.jwtService.sign(payload);

          return{
            access_token: jwtToken,
          }
    }

    async validateUser(email: string, password: string) {
        const user = await this.userService.findByEmail(email);

        if (user) {
            //Checar se a senha informada corresponde a hash que esta no banco.

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
                return {
                    ...user,
                    password: undefined,
                };
            }
        }
        // se chegar aqui, significa que não encontrou um user e/ou a senha não corresponde.
        throw new UnauthorizedError('Email address or password provided is incorrect.',);
    }
}
