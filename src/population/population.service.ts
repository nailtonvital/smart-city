import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PopulationReport, ReportType, ReportStatus, Priority } from './population-report.entity';

@Injectable()
export class PopulationService {
    constructor(
        @InjectRepository(PopulationReport)
        private reportRepository: Repository<PopulationReport>,
    ) { }

    async findAll(): Promise<PopulationReport[]> {
        return this.reportRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findByStatus(status: ReportStatus): Promise<PopulationReport[]> {
        return this.reportRepository.find({
            where: { status },
            order: { createdAt: 'DESC' },
        });
    }

    async findByType(type: ReportType): Promise<PopulationReport[]> {
        return this.reportRepository.find({
            where: { type },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<PopulationReport | null> {
        return this.reportRepository.findOneBy({ id }) || null;
    }

    async create(reportData: Partial<PopulationReport>): Promise<PopulationReport> {
        const report = this.reportRepository.create(reportData);
        return this.reportRepository.save(report);
    }

    async update(id: number, updateData: Partial<PopulationReport>): Promise<PopulationReport | null> {
        await this.reportRepository.update(id, updateData);
        return this.findOne(id);
    }

    async updateStatus(id: number, status: ReportStatus, adminNotes?: string): Promise<PopulationReport | null> {
        const updateData: Partial<PopulationReport> = { status };

        if (adminNotes) {
            updateData.adminNotes = adminNotes;
        }

        if (status === ReportStatus.RESOLVED) {
            updateData.resolvedAt = new Date();
        }

        return this.update(id, updateData);
    }

    async delete(id: number): Promise<void> {
        await this.reportRepository.delete(id);
    }

    async getStatistics() {
        const total = await this.reportRepository.count();
        const pending = await this.reportRepository.count({ where: { status: ReportStatus.PENDING } });
        const inProgress = await this.reportRepository.count({ where: { status: ReportStatus.IN_PROGRESS } });
        const resolved = await this.reportRepository.count({ where: { status: ReportStatus.RESOLVED } });
        const rejected = await this.reportRepository.count({ where: { status: ReportStatus.REJECTED } });

        const byType = await this.reportRepository
            .createQueryBuilder('report')
            .select('report.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .groupBy('report.type')
            .getRawMany();

        const byPriority = await this.reportRepository
            .createQueryBuilder('report')
            .select('report.priority', 'priority')
            .addSelect('COUNT(*)', 'count')
            .groupBy('report.priority')
            .getRawMany();

        return {
            total,
            byStatus: { pending, inProgress, resolved, rejected },
            byType,
            byPriority,
        };
    }

    // Cron job para gerar reportes fictícios da população a cada 15 minutos
    @Cron(CronExpression.EVERY_SECOND)
    async generateFakeReports() {
        console.log('👥 Gerando reportes fictícios da população...');

        // 40% de chance de gerar um reporte
        if (Math.random() < 0.4) {
            const fakeReport = this.generateRandomReport();
            await this.create(fakeReport);
            console.log(`📝 Novo reporte da população: ${fakeReport.title}`);
        }
    }

    // Cron job para atualizar status de reportes automaticamente
    @Cron(CronExpression.EVERY_SECOND)
    async updateReportStatuses() {
        console.log('🔄 Atualizando status de reportes...');

        // Buscar reportes pendentes há mais de 1 hora
        const pendingReports = await this.reportRepository
            .createQueryBuilder('report')
            .where('report.status = :status', { status: ReportStatus.PENDING })
            .andWhere('report.createdAt < :time', { time: new Date(Date.now() - 60 * 60 * 1000) })
            .getMany();

        let updatedCount = 0;

        for (const report of pendingReports) {
            // 60% chance de mover para "em progresso"
            if (Math.random() < 0.6) {
                await this.updateStatus(report.id, ReportStatus.IN_PROGRESS, 'Reporte em análise pela equipe responsável');
                updatedCount++;
            }
        }

        // Buscar reportes em progresso há mais de 2 horas
        const inProgressReports = await this.reportRepository
            .createQueryBuilder('report')
            .where('report.status = :status', { status: ReportStatus.IN_PROGRESS })
            .andWhere('report.createdAt < :time', { time: new Date(Date.now() - 2 * 60 * 60 * 1000) })
            .getMany();

        for (const report of inProgressReports) {
            // 40% chance de resolver, 10% de rejeitar
            const random = Math.random();
            if (random < 0.4) {
                await this.updateStatus(report.id, ReportStatus.RESOLVED, 'Problema solucionado pela equipe de manutenção');
                updatedCount++;
            } else if (random < 0.5) {
                await this.updateStatus(report.id, ReportStatus.REJECTED, 'Reporte não procede após verificação');
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            console.log(`📊 ${updatedCount} reportes tiveram status atualizado`);
        }
    }

    private generateRandomReport(): Partial<PopulationReport> {
        const locations = [
            { name: 'Rua Augusta, Centro', lat: -23.5505, lng: -46.6333 },
            { name: 'Vila Madalena', lat: -23.5598, lng: -46.6890 },
            { name: 'Avenida Paulista', lat: -23.5613, lng: -46.6565 },
            { name: 'Parque Ibirapuera', lat: -23.5873, lng: -46.6578 },
            { name: 'Rua da Consolação', lat: -23.5587, lng: -46.6347 },
            { name: 'Marginal Tietê', lat: -23.5290, lng: -46.6658 },
            { name: 'Bairro do Bixiga', lat: -23.5620, lng: -46.6480 },
            { name: 'Brooklin Novo', lat: -23.6168, lng: -46.7038 },
        ];

        const reportTemplates = [
            {
                type: ReportType.INFRASTRUCTURE,
                titles: ['Buraco na rua', 'Calçada quebrada', 'Semáforo com defeito', 'Falta de iluminação pública'],
                descriptions: [
                    'Grande buraco na pista que está causando problemas para veículos',
                    'Calçada em péssimo estado, dificultando a passagem de pedestres',
                    'Semáforo não está funcionando, causando confusão no trânsito',
                    'Rua muito escura à noite, falta de postes de luz funcionando'
                ],
                priority: Priority.MEDIUM,
            },
            {
                type: ReportType.SECURITY,
                titles: ['Assalto na região', 'Falta de policiamento', 'Área perigosa', 'Vandalismo'],
                descriptions: [
                    'Relatos frequentes de assaltos nesta área, principalmente à noite',
                    'Área com pouco policiamento, moradores se sentem inseguros',
                    'Local muito perigoso para pedestres, principalmente mulheres',
                    'Propriedade pública danificada por vândalos'
                ],
                priority: Priority.HIGH,
            },
            {
                type: ReportType.ENVIRONMENT,
                titles: ['Lixo acumulado', 'Poluição do ar', 'Árvore caída', 'Esgoto a céu aberto'],
                descriptions: [
                    'Muito lixo acumulado na rua, precisando de coleta',
                    'Ar muito poluído na região, causando problemas respiratórios',
                    'Árvore caiu e está bloqueando a passagem',
                    'Esgoto vazando na rua, causando mau cheiro'
                ],
                priority: Priority.MEDIUM,
            },
            {
                type: ReportType.TRAFFIC,
                titles: ['Trânsito intenso', 'Estacionamento irregular', 'Falta de sinalização', 'Acidente frequente'],
                descriptions: [
                    'Trânsito muito lento neste horário, precisa de alternativas',
                    'Carros estacionados irregularmente, atrapalhando o fluxo',
                    'Falta de placas de sinalização na via',
                    'Local com muitos acidentes, precisa de lombada'
                ],
                priority: Priority.MEDIUM,
            },
            {
                type: ReportType.EMERGENCY,
                titles: ['Pessoa necessitando ajuda', 'Vazamento de gás', 'Princípio de incêndio', 'Acidente grave'],
                descriptions: [
                    'Pessoa em situação de rua precisando de assistência médica',
                    'Forte cheiro de gás na região, possível vazamento',
                    'Fumaça saindo de estabelecimento comercial',
                    'Acidente grave com vítimas, precisa de atendimento'
                ],
                priority: Priority.URGENT,
            },
            {
                type: ReportType.SUGGESTION,
                titles: ['Melhoria para a região', 'Nova ciclovia', 'Mais ônibus', 'Área de lazer'],
                descriptions: [
                    'Sugestão para melhorar a qualidade de vida na região',
                    'Região precisa de ciclovia para facilitar deslocamento',
                    'Falta de transporte público, precisa de mais linhas de ônibus',
                    'Comunidade precisa de mais áreas de lazer e esporte'
                ],
                priority: Priority.LOW,
            },
        ];

        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        const randomTemplate = reportTemplates[Math.floor(Math.random() * reportTemplates.length)];
        const randomTitle = randomTemplate.titles[Math.floor(Math.random() * randomTemplate.titles.length)];
        const randomDescription = randomTemplate.descriptions[Math.floor(Math.random() * randomTemplate.descriptions.length)];

        const citizenNames = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Ferreira', 'Lucia Almeida'];
        const randomCitizen = citizenNames[Math.floor(Math.random() * citizenNames.length)];

        return {
            title: randomTitle,
            description: randomDescription,
            type: randomTemplate.type,
            priority: randomTemplate.priority,
            latitude: randomLocation.lat,
            longitude: randomLocation.lng,
            location: randomLocation.name,
            citizenName: randomCitizen,
            citizenContact: `${randomCitizen.toLowerCase().replace(' ', '.')}@email.com`,
        };
    }
}
