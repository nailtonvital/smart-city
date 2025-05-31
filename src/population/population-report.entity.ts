import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ReportType {
  INFRASTRUCTURE = 'infrastructure',
  SECURITY = 'security',
  ENVIRONMENT = 'environment',
  TRAFFIC = 'traffic',
  EMERGENCY = 'emergency',
  SUGGESTION = 'suggestion',
}

export enum ReportStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity()
export class PopulationReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'simple-enum',
    enum: ReportType,
  })
  type: ReportType;

  @Column({
    type: 'simple-enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority: Priority;

  @Column({
    type: 'simple-enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column('decimal', { precision: 10, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6 })
  longitude: number;

  @Column()
  location: string;

  @Column({ nullable: true })
  citizenName: string;

  @Column({ nullable: true })
  citizenContact: string;

  @Column('text', { nullable: true })
  adminNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  resolvedAt: Date;
}
