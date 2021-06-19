import * as React from 'react';
import axios from 'axios';
import {config} from '../../config';
import { oneOf, number, oneOfType, string, shape, func } from 'prop-types';
//ui
import {Select} from 'upkit';

export default function SelectWilayah({tingkat, kodeInduk, onChange, value}){

    let [data, setData] = React.useState([]);
    let [isFetching, setIsFetching] = React.useState(false);

    React.useEffect(() => {

        setIsFetching(true);

        axios.get(`${config.api_host}/api/wilayah/${tingkat}?kode_induk=${kodeInduk}`)
        .then(({data}) => {
            console.log('ok')
            setData(data);
        })
        .finally(_ => setIsFetching(false));

    }, [kodeInduk, tingkat]);

    return <Select options={data.map(wilayah => ({label: wilayah.nama, value: wilayah.kode}))} 
        onChange={onChange}
        value={value}
        isLoading={isFetching}
        isDisabled={isFetching || !data.length}
    />
}

SelectWilayah.defaultProps = {
    tingkat: 'provinsi'
}

SelectWilayah.propTypes = {
    tingkat: oneOf(['provinsi', 'kabupaten', 'kecamatan', 'desa']),
    kodeInduk: oneOfType([string, number]),
    onChange: func,
    value: shape({label: string, value: oneOfType([string, number])})
}