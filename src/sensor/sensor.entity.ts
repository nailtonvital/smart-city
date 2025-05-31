import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum SensorType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  AIR_QUALITY = 'air_quality',
  NOISE = 'noise',
  TRAFFIC = 'traffic',
  FLOOD = 'flood',
  EARTHQUAKE = 'earthquake',
}

export enum SensorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
}

@Entity()
export class Sensor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'simple-enum',
    enum: SensorType,
  })
  type: SensorType;

  @Column('decimal', { precision: 10, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6 })
  longitude: number;

  @Column()
  location: string;

  @Column({
    type: 'simple-enum',
    enum: SensorStatus,
    default: SensorStatus.ACTIVE,
  })
  status: SensorStatus;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  currentValue: number;

  @Column({ nullable: true })
  unit: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minThreshold: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  maxThreshold: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  lastReading: Date;
}
