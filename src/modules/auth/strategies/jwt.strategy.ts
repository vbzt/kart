import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor(){

        
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, 
            algorithms: ['ES256'],
            issuer: 'https://bvyyohemxkievjowtsyi.supabase.co/auth/v1',
            audience: 'authenticated',

            secretOrKeyProvider: jwksRsa.passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: 'https://bvyyohemxkievjowtsyi.supabase.co/auth/v1/.well-known/jwks.json',
                requestHeaders: {}
            })
        })
    }

    async validate(payload: any){
        return { 
            userId: payload.sub,
            email: payload.email
        }
    }
}