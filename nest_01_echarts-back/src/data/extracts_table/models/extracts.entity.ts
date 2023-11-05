import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity('extracts')
export class ExtractsEntity {
    @PrimaryColumn()
    id: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column()
    pages_process: number;

    @Column()
    doc_type: string;

    @Column()
    user_id: number;
}