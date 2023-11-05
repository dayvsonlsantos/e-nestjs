import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class UsersEntity {
    @PrimaryColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    segment: string;
}