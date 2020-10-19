exports.transformers = [
    // A transformer that adds a new property to the response.
    {
        name: 'on behalf of',
        transform: (body, req, res) => {
            const json = JSON.parse(body);
            const user = req.headers['on-behalf-of-customer-id'];
            json.inspectedBy = user;
            return JSON.stringify(json);
        }
    }
];