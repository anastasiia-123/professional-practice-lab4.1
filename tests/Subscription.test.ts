import { SubscriptionService } from '../src/SubscriptionService';

describe('SubscriptionService Unit Tests', () => {
    let service: SubscriptionService;
    let mockRepo: any;
    let mockPayment: any;
    let mockEmail: any;

    beforeEach(() => {

        mockRepo = { findByUserId: jest.fn(), save: jest.fn(), update: jest.fn() };
        mockPayment = { charge: jest.fn() };
        mockEmail = { send: jest.fn() };
        service = new SubscriptionService(mockRepo, mockPayment, mockEmail);
    });


    test('Should subscribe to free plan successfully (AAA Pattern)', async () => {

        mockRepo.findByUserId.mockResolvedValue(null);
        mockRepo.save.mockResolvedValue({ plan: 'free' });


        const result = await service.subscribe(101, 'free');


        expect(result.plan).toBe('free');
        expect(mockPayment.charge).not.toHaveBeenCalled();
    });


    test('Should throw error on downgrade attempt', async () => {

        mockRepo.findByUserId.mockResolvedValue({ plan: 'premium' });


        await expect(service.upgrade(101, 'basic')).rejects.toThrow('Cannot downgrade');
    });
});