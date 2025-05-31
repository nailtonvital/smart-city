import { Controller, Get, Post, Put, Delete, Body, Param, Query, Patch } from '@nestjs/common';
import { PopulationService } from './population.service';
import { PopulationReport, ReportStatus, ReportType } from './population-report.entity';

@Controller('population')
export class PopulationController {
    constructor(private readonly populationService: PopulationService) { }

    @Get('reports')
    async findAll(): Promise<PopulationReport[]> {
        return this.populationService.findAll();
    }

    @Get('reports/status/:status')
    async findByStatus(@Param('status') status: ReportStatus): Promise<PopulationReport[]> {
        return this.populationService.findByStatus(status);
    }

    @Get('reports/type/:type')
    async findByType(@Param('type') type: ReportType): Promise<PopulationReport[]> {
        return this.populationService.findByType(type);
    }

    @Get('reports/statistics')
    async getStatistics() {
        return this.populationService.getStatistics();
    }

    @Get('reports/:id')
    async findOne(@Param('id') id: number): Promise<PopulationReport> {
        // return this.populationService.findOne(id);
        const report = await this.populationService.findOne(id);
        if (!report) {
            throw new Error(`Report with ID ${id} not found`);
        }
        return report;
    }

    @Post('reports')
    async create(@Body() reportData: Partial<PopulationReport>): Promise<PopulationReport> {
        return this.populationService.create(reportData);
    }

    @Put('reports/:id')
    async update(
        @Param('id') id: number,
        @Body() updateData: Partial<PopulationReport>,
    ): Promise<PopulationReport | null> {
        const result = this.populationService.update(id, updateData);
        if (result === null) {
            throw new Error(`Report with ID ${id} not found`);
        }
        return result;
    }

    @Patch('reports/:id/status')
    async updateStatus(
        @Param('id') id: number,
        @Body() body: { status: ReportStatus; adminNotes?: string },
    ): Promise<PopulationReport> {
        // return this.populationService.updateStatus(id, body.status, body.adminNotes);
        const report = await this.populationService.updateStatus(id, body.status, body.adminNotes);
        if (!report) {
            throw new Error(`Report with ID ${id} not found`);
        }
        return report;
    }

    @Delete('reports/:id')
    async delete(@Param('id') id: number): Promise<void> {
        return this.populationService.delete(id);
    }
}
