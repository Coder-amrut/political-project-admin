# Master Data Reference

Captured on **1 October 2026** from the official Maharashtra Common Village Master / Local Government Directory (LGD) service. These files are reference CSVs only; they have not been loaded into the project database.

## Files

| File | Records | Contents |
|---|---:|---|
| `lgd_states.csv` | 1 | State code and names (English and Marathi) |
| `lgd_districts.csv` | 36 | District code and names |
| `lgd_talukas.csv` | 358 | District code, subdistrict/taluka code and names |
| `lgd_villages.csv` | 44,929 | District, taluka and village codes and names |
| `lgd_local_bodies.csv` | 28,300 | Local-body name/type, with available district, taluka and village codes |

All files are UTF-8 CSVs. Codes are exported as text to preserve leading zeroes where present. Whitespace in fields has been trimmed, and the repeated state row in the source response was deduplicated. Do not treat the total number of local bodies in this file as a count of wards or booths: the file includes the local-body types supplied by LGD.

## Source and fields

The records were retrieved from the POST services documented by the [Maharashtra Common Village Master API guide](https://mahavillages.mahabhumi.gov.in/pdf/LGD%20WebServices.pdf). The service provides state, district, taluka, village and local-body data. The [Common Village Master portal](https://mahavillages.mahabhumi.gov.in/all_list.php) publishes its current coverage totals and is maintained by the Settlement Commissioner and Director of Land Records, Maharashtra.

The API guide documents these endpoints: `GetState`, `GetAllDistricts`, `GetAllTalukas`, `GetAllVillages`, and `GetAllLocalBodies`. The guide was published in 2022 and documents an HTTP service URL. Treat this snapshot as source data with a capture date; refresh and validate it against the portal before production imports.

## Recommended selection relationships

Use codes as stable keys and names as display labels. For administrative browsing, the available files support:

`State → District → Taluka → Village → Local body (where linked)`

Election geography is a different system. Here “Constituency” should be split into **Parliamentary Constituency (PC / Lok Sabha)** and **Assembly Constituency (AC / Vidhan Sabha)**. The [CEO Maharashtra constituency documents](https://ceoelection.maharashtra.gov.in/Downloads/PDF/PCs.pdf) describe PC-to-AC composition; the [CEO Maharashtra AC list](https://ceoelection.maharashtra.gov.in/Downloads/PDF/ACs.pdf) lists assembly constituencies. Election navigation should be represented as:

`State → PC → AC → Polling station / polling part`

Do not put PC between District and Taluka in one parent-child chain. Electoral constituencies and administrative boundaries are separate boundary systems and do not form a reliable single hierarchy. If users need to navigate between them, maintain explicit cross-reference relationships between the administrative units and election units.

## Not included in this download

- **PC and AC records/mapping:** CEO Maharashtra publishes constituency lists and delimitation documents, but those election records have not been normalized into import-ready CSVs here. Use the official documents above and confirm the intended election/delimitation version before importing.
- **Polling stations / booths:** Booth or polling-part lists are election-event-specific and can change. CEO Maharashtra provides polling-station lookup and constituency-wise lists; select and capture the required election year/version before treating them as a master list. A booth is not the same entity as a village or ward.
- **Wards:** Wards belong to local bodies and are delimited for local elections. The [Maharashtra State Election Commission](https://mahasec.maharashtra.gov.in/Home/) is the relevant official source. A single statewide ward CSV without local body and delimitation date would be misleading.
- **Area:** “Area” is not a single standardized statewide election layer in the sources above. Define the intended meaning (for example, locality, campaign area, or a booth coverage area) and maintain it as project-defined data linked to the required parent entity.

## Important project integration note

These CSVs are not direct SQL imports. The existing project geography schema requires a project association and models each geography with one parent. The data above is shared reference data, and the administrative and electoral hierarchies are separate. Importing these records correctly may require a master-data mapping or schema decision. No project code or database was changed while preparing this folder.
