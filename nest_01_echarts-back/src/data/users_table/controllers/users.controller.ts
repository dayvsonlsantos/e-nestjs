import { Controller, Get } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { Observable } from 'rxjs';
import { Users } from '../models/users.interface';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    findAll(): Observable<Users[]> {
        return this.usersService.findAll();
    }
}
