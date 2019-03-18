var data = [{
    "id": "5ab41f8371791e8a7ea0dbf7",
    "kind": "person",
    "entries": [{
            "id": "2",
            "parent_id": "1",
            "key": "A123",
            "kind": "external interest identifier",
            "origin": "capital"
        },
        {
            "id": "3",
            "parent_id": "2",
            "key": "12345",
            "kind": "internal interest identifier",
            "origin": "capital"
        }
    ]
}];

exports.transformers = [
    {
        name: 'master index identifiers',
        path: '/system/master-index/v1/identifiers',
        transform: (body, req, res) => {
            
            const ids = data.map(i => i.id);
            
            res.status(200)
            return JSON.stringify(ids);
        }
    },
    {
        name: 'entries by id',
        path: '/system/master-index/v1/entries',
        transform: (body, req, res) => {
            
            const ids = req.body;

            const entries = data.filter(i => ids.indexOf(i.id) > -1);

            if (entries.length > 0) {
                res.status(200)
            } 
            else {
                res.status(404);
            }
            return JSON.stringify(entries);
        }
    },
    {
        name: 'simple entry search',
        path: '/system/master-index/v1/entries/search/simple',
        transform: (body, req, res) => {
            
            const entriesToMatch = req.body;

            console.log(entriesToMatch);

            const entries = data.filter(entry => {
                console.log(entry);

                const matchingSubEntries = entry.entries.filter(subEntry => entriesToMatch.filter(m => m.key === subEntry.key && m.kind === subEntry.kind && m.origin === subEntry.origin).length > 0);

                console.log(matchingSubEntries);

                return matchingSubEntries.length > 0;
            });

            if (entries.length > 0) {
                res.status(200)
            } 
            else {
                res.status(404);
            }
            return JSON.stringify(entries);
        }
    }

];