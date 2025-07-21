## Examples

```typescript
import { ScConvert } from "@interfaces/soroban/helpers/ScConvert";
import { Soroban } from "@interfaces/soroban";

async getBalance({ accountId, contractId }): Promise<SimulationResult> {
  const sorobanService = new Soroban();
  const { simulationResponse } = await sorobanService.simulateContract({
    contractId,
    method: "balance",
    args: [ScConvert.accountIdToScVal(accountId)],
  });

  return ScConvert.scValToBigInt(simulationResponse.result!.retval);
}
```
