import {formatters} from 'web3-core-helpers';
// import GetGasPriceMethod from '../../../../src/methods/node/GetGasPriceMethod';

// Mocks
// jest.mock('formatters');

import Web3 from 'web3';
import FakeIpcProvider from '../helpers/FakeIpcProvider';

/**
 * BatchRequest test
 */
describe('BatchRequest', () => {
    let method;

    beforeEach(() => {
        
    });

    it('should execute batch request', () => {
        var provider = new FakeIpcProvider();
        var web3 = new Web3(provider);

        var result = '0x126';
        var resultVal = '294';
        var result2 = '0x127';
        var result2Val = '295';
        provider.injectBatchResults([result, result2]);

        var counter = 0;
        var callback = function(err, r) {
            counter++;
            assert.deepEqual(r, resultVal);
        };

        var callback2 = function(err, r) {
            assert.equal(counter, 1);
            assert.deepEqual(r, result2Val);
            done();
        };

        provider.injectValidation(function(payload) {
            var first = payload[0];
            var second = payload[1];

            assert.equal(first.method, 'eth_getBalance');
            assert.deepEqual(first.params, ['0x0000000000000000000000000000000000000000', 'latest']);
            assert.equal(second.method, 'eth_getBalance');
            assert.deepEqual(second.params, ['0x0000000000000000000000000000000000000005', 'latest']);
        });

        var batch = new web3.BatchRequest();
        batch.add(web3.eth.getBalance.request('0x0000000000000000000000000000000000000000', 'latest', callback));
        batch.add(web3.eth.getBalance.request('0x0000000000000000000000000000000000000005', 'latest', callback2));
        batch.execute();
    });
});
