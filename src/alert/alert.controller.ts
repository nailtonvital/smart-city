import { Controller, Get, Post, Put, Delete, Body, Param, Patch } from '@nestjs/common';
import { AlertService } from './alert.service';
import { Alert } from './alert.entity';

@Controller('alerts')
export class AlertController {
    constructor(private readonly alertService: AlertService) { }

    @Get()
    async findAll(): Promise<Alert[]> {
        return this.alertService.findAll();
    }

    @Get('active')
    async findActive(): Promise<Alert[]> {
        return this.alertService.findActive();
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<Alert> {
        if (!id) {
            throw new Error('ID is required to find an alert');
        }
        const alert = await this.alertService.findOne(id);
        if (!alert) {
            throw new Error(`Alert with ID ${id} not found`);
        }
        return alert;
    }

    @Post()
    async create(@Body() alertData: Partial<Alert>): Promise<Alert> {
        return this.alertService.create(alertData);
    }

    @Put(':id')
    async update(
        @Param('id') id: number,
        @Body() updateData: Partial<Alert>,
    ): Promise<Alert> {
        const updated = await this.alertService.update(id, updateData);
        if (!updated) {
            throw new Error(`Alert with ID ${id} not found for update`);
        }
        return updated;
    }

    @Patch(':id/acknowledge')
    async acknowledge(@Param('id') id: number): Promise<Alert> {
        const acknowledged = await this.alertService.acknowledge(id);
        if (!acknowledged) {
            throw new Error(`Alert with ID ${id} not found for acknowledge`);
        }
        return acknowledged;
    }

    @Patch(':id/resolve')
    async resolve(@Param('id') id: number): Promise<Alert> {
        const resolved = await this.alertService.resolve(id);
        if (!resolved) {
            throw new Error(`Alert with ID ${id} not found for resolve`);
        }
        return resolved;
    }

    @Delete(':id')
    async delete(@Param('id') id: number): Promise<void> {
        return this.alertService.delete(id);
    }
}
