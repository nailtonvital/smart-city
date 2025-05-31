import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Sensor } from '../sensor/sensor.entity';

export enum AlertLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  ACKNOWLEDGED = 'acknowledged',
}

@Entity()
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'simple-enum',
    enum: AlertLevel,
  })
  level: AlertLevel;

  @Column({
    type: 'simple-enum',
    enum: AlertStatus,
    default: AlertStatus.ACTIVE,
  })
  status: AlertStatus;

  @Column('decimal', { precision: 10, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6 })
  longitude: number;

  @Column()
  location: string;

  @Column({ nullable: true })
  sensorId: number;

  @ManyToOne(() => Sensor, { nullable: true })
  @JoinColumn({ name: 'sensorId' })
  sensor: Sensor;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  triggerValue: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  acknowledgedAt: Date;
}
