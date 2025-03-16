import axios, { AxiosInstance } from 'axios';
import * as qs from 'querystring';
import * as https from 'https';
export class Sitad {

    private clientPec: AxiosInstance;

    constructor() {
        this.clientPec = axios.create({
            baseURL: 'https://esbapi.pec.ir/',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Basic bS5tb2hhbW1hZGlAcGVjLmlyOkNvZGVyZWRAMjAxNg=='
            },
          });
    }
    async  getInfo(nationalcode, birthdate): Promise<any>{

        const args = {
            NationalCode: nationalcode,
            BirthDate: birthdate
        }

        const { data } =  await this.clientPec.post('ApiManager/Vas/GetPerson', args);

        if ( !data || data.Status != 0 ){
            return null;
        } else {
            return {
                birthDate: birthdate,
                nin: nationalcode,
                name: data.Data.Name,
                family: data.Data.Family ,
                fatherName: data.Data.FatherName,
                officeName: " "
            }
        }

    }

    async getInfoOld(nationalcode, birthdate): Promise<any>{
        axios.defaults.baseURL = 'http://172.20.45.35:8081';
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        const args = qs.stringify({
            nin : nationalcode,
            birthDate: birthdate
        });
        const data = await axios.post('/', args);
        return data.data;
    }

    async shahkar( mobile, nationalcode): Promise<any> {
        axios.defaults.baseURL = 'http://172.20.45.35:8081';
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        const args = qs.stringify({
            nationalcode : nationalcode,
            mobile: mobile
        });
        const data = await axios.post('/shakar', args);
        return data.data;
    }

    async post( postalcode ): Promise<any> {
        axios.defaults.baseURL = 'http://172.20.45.35:8081';
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        const args = qs.stringify({
            postalcode : postalcode,
        });
        const data = await axios.post('/post', args);
        return data.data;
    }

    async asnaf( idcode ): Promise<any> {
        axios.defaults.baseURL = 'http://172.20.45.35:8081';
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        const args = qs.stringify({
            idcode : idcode,
        });
        const data = await axios.post('/asnaf', args);
        return data.data;
    }
}