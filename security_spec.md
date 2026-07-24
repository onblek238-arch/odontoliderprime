# Security Specification for Odonto Líder Prime

## Data Invariants
- An appointment must have a valid treatment, unit, date, and time.
- The status of a new appointment must always be 'pending'.
- Timestamps `createdAt` and `updatedAt` must be server-validated.

## Access Control
- **Create**: Public access (anyone can book).
- **Read/Update/Delete**: Strictly restricted to Administrators.
- **Admin Identity**: Verified via a document in the `admins` collection where ID matches user UID.

## The Dirty Dozen (Test Matrix)
1. **Unauthenticated Read**: Attempt to list appointments without being logged in. -> DENIED
2. **Patient Identity Spoofing**: Attempt to update another patient's appointment. -> DENIED (only admins can update)
3. **Admin Privilege Escalation**: Attempt to create a document in `/admins/` as a normal user. -> DENIED
4. **Invalid Status on Create**: Attempt to create an appointment with status 'confirmed'. -> DENIED (must be 'pending')
5. **Future Date Validation**: (Client side primary, rules enforce existence).
6. **Malicious Payload**: Attempt to inject 1MB string into `notes`. -> DENIED (size limit)
7. **Bypassing App Logic**: Attempt to list all appointments from the client console. -> DENIED
8. **Shadow Update**: Attempt to update `patientName` without being admin. -> DENIED
9. **Timestamp Manipulation**: Providing a custom `createdAt` in the past. -> DENIED
10. **ID Poisoning**: Attempt to use a 2KB string as `appointmentId`. -> DENIED
11. **Unit Injection**: Attempt to set unit to 'Hospital ABC'. -> DENIED (enum check)
12. **Enum Overflow**: Setting status to 'secret_level_1'. -> DENIED

## Test Runner (Logic Overview)
The `firestore.rules` will be tested against these cases to ensure zero-leakage of patient data.
