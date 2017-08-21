# splitter
Splitter Contract

Splits a sender's deposit equally between two receivers.

- Accepts deposits values >= 2
- Re-allocates 1 wei back to sender when odd values are sent
- Does not accept address(0) as a receiver
- Recepients must claim their share 
- Owner has sole access to suspend all functions or kill the contract
