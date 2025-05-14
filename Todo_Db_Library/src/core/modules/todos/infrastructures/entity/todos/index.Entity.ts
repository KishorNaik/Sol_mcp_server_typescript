import { IsNotEmpty, IsString } from 'class-validator';
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { IsSafeString } from '../../../../../shared/utils/validations/decorators/isSafeString';
import { BaseEntity } from '../../../../../shared/entity/base';

@Entity()
export class ToDoEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	public id?: number;

	@Column({ type: 'varchar', length: 255 })
	@IsString()
	@IsSafeString()
	@IsNotEmpty()
	public title?: string;

	@Column({ type: 'text', nullable: true })
	@IsString()
	@IsSafeString()
	@IsNotEmpty()
	public description?: string;
}
