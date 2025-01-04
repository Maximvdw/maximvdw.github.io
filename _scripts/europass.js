const axios = require('axios');

const postData = async () => {
    try {
        const response = await axios.post('https://europa.eu/europass/eportfolio/api/eprofile/europass-cv', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data'
            },
            data: {
                file: 'http://localhost:8080/cv/europass.xml'
            }
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error making POST request:', error);
    }
};

postData();