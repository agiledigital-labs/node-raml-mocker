var count = 0;

exports.transformers = [
    // A transformer that adds a new property to the response.
    {
        name: 'stateful counter',
        transform: (body, req, res) => {
            count += 1;
            const json = JSON.parse(body);
            json.count = count;
            res.status(200)
            return JSON.stringify(json);
        }
    },
    // A transformer that doesn't modify the response.
    {
        name: 'no-op logger',
        transform: () => console.log('hi')
    }
];