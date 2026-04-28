export type Plan = 'free' | 'basic' | 'premium';

export class SubscriptionService {
    constructor(
        private repository: any, 
        private payment: any,    
        private email: any       
    ) {}

    async subscribe(userId: number, plan: Plan) {
        const existing = await this.repository.findByUserId(userId);
        if (existing) throw new Error('Subscription already exists');

        if (plan !== 'free') {
            await this.payment.charge(userId, plan === 'premium' ? 100 : 50);
        }

        const sub = { userId, plan, status: 'active', daysLeft: 30 };
        await this.repository.save(sub);
        await this.email.send(userId, `Welcome to ${plan}`);
        return sub;
    }

    async upgrade(userId: number, newPlan: Plan) {
        const sub = await this.repository.findByUserId(userId);
        if (!sub) throw new Error('No subscription found');

        const levels = { free: 0, basic: 1, premium: 2 };
        if (levels[newPlan] <= levels[sub.plan as Plan]) {
            throw new Error('Cannot downgrade using upgrade method');
        }

        await this.payment.charge(userId, 50);
        return await this.repository.update(userId, { plan: newPlan });
    }

    isFeatureAllowed(plan: Plan, feature: string): boolean {
        const permissions: Record<Plan, string[]> = {
            free: ['read'],
            basic: ['read', 'write'],
            premium: ['read', 'write', 'admin']
        };
        return permissions[plan].includes(feature);
    }
}