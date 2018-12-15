import {AbstractWeb3Module} from 'web3-core';
import {PromiEvent} from 'web3-core-promievent';
import TransactionReceiptValidator from '../../../src/validators/TransactionReceiptValidator';
import NewHeadsWatcher from '../../../src/watchers/NewHeadsWatcher';
import AbstractMethod from '../../../lib/methods/AbstractMethod';
import ContractDeployMethod from '../../__mocks__/ContractDeployMethod'
import TransactionConfirmationWorkflow from '../../../src/workflows/TransactionConfirmationWorkflow';
import GetTransactionReceiptMethod from '../../../src/methods/transaction/GetTransactionReceiptMethod';

// Mocks
jest.mock('../../../src/validators/TransactionReceiptValidator');
jest.mock('../../../src/watchers/NewHeadsWatcher');
jest.mock('../../../src/methods/transaction/GetTransactionReceiptMethod');
jest.mock('../../../lib/methods/AbstractMethod');
jest.mock('AbstractWeb3Module');

/**
 * TransactionConfirmationWorkflow test
 */
describe('TransactionConfirmationWorkflowTest', () => {
    let transactionConfirmationWorkflow,
        transactionReceiptValidator,
        transactionReceiptValidatorMock,
        newHeadsWatcher,
        newHeadsWatcherMock,
        method,
        methodMock,
        moduleInstance,
        moduleInstanceMock,
        getTransactionReceiptMethod,
        getTransactionReceiptMethodMock,
        promiEvent;

    beforeEach(() => {
        transactionReceiptValidator = new TransactionReceiptValidator();
        transactionReceiptValidatorMock = TransactionReceiptValidator.mock.instances[0];

        newHeadsWatcher = new NewHeadsWatcher({});
        newHeadsWatcherMock = NewHeadsWatcher.mock.instances[0];

        method = new AbstractMethod();
        methodMock = AbstractMethod.mock.instances[0];

        moduleInstance = new AbstractWeb3Module({}, {}, {}, {});
        moduleInstanceMock = AbstractWeb3Module.mock.instances[0];

        getTransactionReceiptMethod = new GetTransactionReceiptMethod({}, {}, {});
        getTransactionReceiptMethodMock = GetTransactionReceiptMethod.mock.instances[0];

        promiEvent = new PromiEvent();
    });

    it('constructor check', () => {
        transactionConfirmationWorkflow = new TransactionConfirmationWorkflow(
            transactionReceiptValidatorMock,
            newHeadsWatcherMock,
            getTransactionReceiptMethodMock
        );

        expect(transactionConfirmationWorkflow.transactionReceiptValidator)
            .toEqual(transactionReceiptValidatorMock);

        expect(transactionConfirmationWorkflow.newHeadsWatcher)
            .toEqual(newHeadsWatcherMock);

        expect(transactionConfirmationWorkflow.getTransactionReceiptMethod)
            .toEqual(getTransactionReceiptMethodMock);
    });

    it('calls executes and receipt does already exists but is invalid', (done) => {
        methodMock.callback = jest.fn();

        getTransactionReceiptMethodMock.execute
            .mockReturnValueOnce(Promise.resolve({blockHash: true}));

        transactionReceiptValidatorMock.validate
            .mockReturnValueOnce(false);

        transactionConfirmationWorkflow = new TransactionConfirmationWorkflow(
            transactionReceiptValidatorMock,
            newHeadsWatcherMock,
            getTransactionReceiptMethodMock
        );

        transactionConfirmationWorkflow.execute(methodMock, moduleInstanceMock, '0x0', promiEvent);

        promiEvent.catch((error) => {
            expect(error)
                .toEqual(false);

            expect(getTransactionReceiptMethodMock.arguments)
                .toEqual(['0x0']);

            expect(getTransactionReceiptMethodMock.execute)
                .toHaveBeenCalledWith(moduleInstanceMock);

            expect(transactionReceiptValidatorMock.validate)
                .toHaveBeenCalledWith({blockHash: true});

            expect(transactionConfirmationWorkflow.timeoutCounter)
                .toEqual(0);

            expect(transactionConfirmationWorkflow.confirmationsCounter)
                .toEqual(0);

            expect(newHeadsWatcherMock.stop)
                .toHaveBeenCalled();

            expect(methodMock.callback)
                .toHaveBeenCalledWith(error, null);

            done();
        });
    });

    it('calls executes and receipt does already exists', (done) => {
        methodMock.callback = jest.fn(() => {
            done();
        });

        getTransactionReceiptMethodMock.execute
            .mockReturnValueOnce(Promise.resolve({blockHash: '0x0'}));

        transactionReceiptValidatorMock.validate
            .mockReturnValueOnce(true);

        methodMock.afterExecution
            .mockReturnValueOnce({blockHash: '0x0'});

        transactionConfirmationWorkflow = new TransactionConfirmationWorkflow(
            transactionReceiptValidatorMock,
            newHeadsWatcherMock,
            getTransactionReceiptMethodMock
        );

        transactionConfirmationWorkflow.execute(
            methodMock,
            moduleInstanceMock,
            '0x0',
            promiEvent
        );

        promiEvent.on('receipt', (receipt) => {
            expect(receipt)
                .toEqual({blockHash: '0x0'});

            expect(methodMock.callback)
                .toHaveBeenCalledWith(false, {blockHash: '0x0'});

            expect(newHeadsWatcherMock.stop)
                .toHaveBeenCalled();

            expect(methodMock.afterExecution)
                .toHaveBeenCalledWith({blockHash: '0x0'});

            expect(transactionReceiptValidatorMock.validate)
                .toHaveBeenCalledWith({blockHash: '0x0'});
        });
    });

    it('calls executes with ContractDeployMethod and receipt does already exists', (done) => {
        const contractDeployMethodMock = new ContractDeployMethod();
        contractDeployMethodMock.afterExecution = jest.fn();
        contractDeployMethodMock.callback = jest.fn(() => {
            done();
        });

        getTransactionReceiptMethodMock.execute
            .mockReturnValueOnce(Promise.resolve({blockHash: '0x0'}));

        transactionReceiptValidatorMock.validate
            .mockReturnValueOnce(true);

        methodMock.afterExecution
            .mockReturnValueOnce({blockHash: '0x0'});

        transactionConfirmationWorkflow = new TransactionConfirmationWorkflow(
            transactionReceiptValidatorMock,
            newHeadsWatcherMock,
            getTransactionReceiptMethodMock
        );

        transactionConfirmationWorkflow.execute(
            contractDeployMethodMock,
            moduleInstanceMock,
            '0x0',
            promiEvent
        );

        promiEvent.on('receipt', (receipt) => {
            expect(receipt)
                .toEqual({blockHash: '0x0'});

            expect(contractDeployMethodMock.callback)
                .toHaveBeenCalledWith(false, {blockHash: '0x0'});

            expect(newHeadsWatcherMock.stop)
                .toHaveBeenCalled();

            expect(contractDeployMethodMock.afterExecution)
                .toHaveBeenCalledWith({blockHash: '0x0'});

            expect(transactionReceiptValidatorMock.validate)
                .toHaveBeenCalledWith({blockHash: '0x0'});
        });
    });

    it('calls executes and receipt doesn\'t already exists', async (done) => {
        methodMock.callback = jest.fn(() => {
            done();
        });

        getTransactionReceiptMethodMock.execute
            .mockReturnValueOnce(Promise.resolve(false));

        getTransactionReceiptMethodMock.execute
            .mockReturnValueOnce(Promise.resolve({blockHash: '0x0'}));

        newHeadsWatcherMock.on = jest.fn((name, method) => {
            expect(name)
                .toEqual('newHead');

            method();
        });

        newHeadsWatcherMock.watch
            .mockReturnValueOnce(newHeadsWatcherMock);

        newHeadsWatcher.isPolling = true;
        moduleInstanceMock.transactionPollingTimeout = 1;
        moduleInstanceMock.transactionConfirmationBlocks = 1;

        transactionReceiptValidatorMock.validate
            .mockReturnValueOnce(true);

        methodMock.afterExecution
            .mockReturnValueOnce({blockHash: '0x0'});

        transactionConfirmationWorkflow = new TransactionConfirmationWorkflow(
            transactionReceiptValidatorMock,
            newHeadsWatcherMock,
            getTransactionReceiptMethodMock
        );

        transactionConfirmationWorkflow.execute(methodMock, moduleInstanceMock, '0x0', promiEvent);

        await promiEvent;

        promiEvent.on('confirmation', (confirmationsCounter, receipt) => {
            expect(transactionConfirmationWorkflow.timeoutCounter)
                .toEqual(1);

            expect(confirmationsCounter)
                .toEqual(1);

            expect(receipt)
                .toEqual({blockHash: '0x0'});
        });

        promiEvent.on('receipt', receipt => {
            expect(receipt)
                .toEqual({blockHash: '0x0'});

            expect(promiEvent.listeners().length)
                .toEqual(0);

            expect(methodMock.callback)
                .toHaveBeenCalledWith(false, {blockHash: '0x0'});

            expect(newHeadsWatcherMock.stop)
                .toHaveBeenCalled();

            expect(methodMock.afterExecution)
                .toHaveBeenCalledWith({blockHash: '0x0'});

            expect(transactionReceiptValidatorMock.validate)
                .toHaveBeenCalledWith({blockHash: '0x0'});

            done();
        });
    });

    it('calls executes and receipt doesn\'t already exists and is invalid on first confirmation', async (done) => {
        methodMock.callback = jest.fn();

        getTransactionReceiptMethodMock.execute
            .mockReturnValueOnce(Promise.resolve(false))
            .mockReturnValueOnce(Promise.resolve({blockHash: '0x0'}));

        newHeadsWatcherMock.on = jest.fn((name, method) => {
            expect(name)
                .toEqual('newHead');

            method();
        });

        newHeadsWatcherMock.watch
            .mockReturnValueOnce(newHeadsWatcherMock);

        newHeadsWatcher.isPolling = false;
        moduleInstanceMock.transactionBlockTimeout = 1;
        moduleInstanceMock.transactionConfirmationBlocks = 1;

        transactionReceiptValidatorMock.validate
            .mockReturnValueOnce(false);

        transactionConfirmationWorkflow = new TransactionConfirmationWorkflow(
            transactionReceiptValidatorMock,
            newHeadsWatcherMock,
            getTransactionReceiptMethodMock
        );

        transactionConfirmationWorkflow.execute(methodMock, moduleInstanceMock, '0x0', promiEvent);

        promiEvent.on('error', error => {
            expect(error)
                .toEqual(false);

            expect(promiEvent.listeners().length)
                .toEqual(0);

            expect(methodMock.callback)
                .toHaveBeenCalledWith(false, null);

            expect(newHeadsWatcherMock.stop)
                .toHaveBeenCalled();

            expect(transactionReceiptValidatorMock.validate)
                .toHaveBeenCalledWith({blockHash: '0x0'}, methodMock.parameters);

            expect(getTransactionReceiptMethodMock.execute)
                .toHaveBeenNthCalledWith(2, moduleInstanceMock);

            expect(newHeadsWatcherMock.watch)
                .toHaveBeenCalledWith(moduleInstance);

            done();
        });

        try {
            await promiEvent;
        } catch (e) {
            expect(e)
                .toEqual(false);
        }

    });

    it('calls executes and receipt doesn\'t already exists and is invalid on first confirmation (polling)', async (done) => {
        methodMock.callback = jest.fn();

        getTransactionReceiptMethodMock.execute
            .mockReturnValueOnce(Promise.resolve(false))
            .mockReturnValueOnce(Promise.resolve({blockHash: '0x0'}));

        newHeadsWatcherMock.on = jest.fn((name, method) => {
            expect(name)
                .toEqual('newHead');

            method();
        });

        newHeadsWatcherMock.watch
            .mockReturnValueOnce(newHeadsWatcherMock);

        newHeadsWatcherMock.isPolling = true;
        moduleInstanceMock.transactionPollingTimeout = 0;

        transactionConfirmationWorkflow = new TransactionConfirmationWorkflow(
            transactionReceiptValidatorMock,
            newHeadsWatcherMock,
            getTransactionReceiptMethodMock
        );

        transactionConfirmationWorkflow.execute(methodMock, moduleInstanceMock, '0x0', promiEvent);

        promiEvent.on('error', error => {
            expect(error.message)
                .toEqual('Transaction was not mined within 0 seconds, please make sure your transaction was properly sent. Be aware that it might still be mined!');

            expect(promiEvent.listeners().length)
                .toEqual(0);

            expect(methodMock.callback)
                .toHaveBeenCalledWith(
                    error,
                    null
                );

            expect(newHeadsWatcherMock.stop)
                .toHaveBeenCalled();

            done();
        });

        try {
            await promiEvent;
        } catch (e) {
            expect(e.message)
                .toEqual('Transaction was not mined within 0 seconds, please make sure your transaction was properly sent. Be aware that it might still be mined!');
        }
    });
});
