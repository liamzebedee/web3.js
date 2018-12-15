/*
    This file is part of web3.js.
    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file contract-tests.ts
 * @author Josh Stevens <joshstevens19@hotmail.co.uk>
 * @date 2018
 */

import { Contract } from 'web3-eth-contract';

const contract = new Contract('http://localhost:500', {});

// $ExpectType Contract
contract.clone();

// $ExpectType DeployTransactionResponse
contract.deploy({
    data: '0x12345...',
    arguments: [123, 'My String']
});

// $ExpectType void
contract.once('MyEvent', {
    filter: {myIndexedParam: [20,23], myOtherIndexedParam: '0x123456789...'},
    fromBlock: 0
}, (error, event) => { console.log(event); });

// $ExpectType void
contract.once('MyEvent', (error, event) => { console.log(event); });

// $ExpectType Promise<EventData[]>
contract.getPastEvents('MyEvent');

// $ExpectType Promise<EventData[]>
contract.getPastEvents('MyEvent', {
    filter: {myIndexedParam: [20,23], myOtherIndexedParam: '0x123456789...'},
    fromBlock: 0,
    toBlock: 'latest'
});

// $ExpectType Promise<EventData[]>
contract.getPastEvents('MyEvent', {
    filter: {myIndexedParam: [20,23], myOtherIndexedParam: '0x123456789...'},
    fromBlock: 0,
    toBlock: 'latest'
}, (error, events) => { console.log(events); });

// $ExpectType Promise<EventData[]>
contract.getPastEvents('MyEvent', (error, events) => { console.log(events); });
