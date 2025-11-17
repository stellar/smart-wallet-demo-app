//! # Router contract
//!
//!  Based on https://github.com/Creit-Tech/Stellar-Router-Contract/blob/04975c434dec362584aa99458ae2c25d803ec570/contracts/router-v0/src/lib.rs
#![no_std]

use soroban_sdk::{contract, contractimpl, vec, Address, Env, Symbol, Val, Vec};

pub const DAY_IN_LEDGERS: u32 = 17280;

pub const INSTANCE_EXTEND_AMOUNT: u32 = 30 * DAY_IN_LEDGERS;
pub const INSTANCE_TTL_THRESHOLD: u32 = INSTANCE_EXTEND_AMOUNT - (7 * DAY_IN_LEDGERS);

#[contract]
pub struct Router;

#[contractimpl]
impl Router {
    pub fn exec(
        e: Env,
        caller: Address,
        invocations: Vec<(Address, Symbol, Vec<Val>)>,
    ) -> Vec<Val> {
        e.storage()
            .instance()
            .extend_ttl(INSTANCE_TTL_THRESHOLD, INSTANCE_EXTEND_AMOUNT);

        caller.require_auth();

        let mut results: Vec<Val> = vec![&e];
        for (contract, method, args) in invocations {
            results.push_back(e.invoke_contract::<Val>(&contract, &method, args));
        }
        results
    }
}

mod test;
