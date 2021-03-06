import * as React from 'react';
import {Link} from 'react-router-dom';
//ui
import { LayoutOne, Table, Button, Text } from 'upkit';
//component
import TopBar from '../../components/TopBar';
import StatusLabel from '../../components/StatusLabel';
//utils
import { formatRupiah } from '../../utils/format-rupiah';
import { sumPrice } from '../../utils/sum-price';
//icons
import FaFileInvoiceDollar from '@meronex/icons/fa/FaFileInvoiceDollar';
//api
import { getOrders } from '../../api/order';


const columns = [
    {Header: '', id: 'Status', accessor: order => {
        return <div>
            #{order.order_number} <br/>
            <StatusLabel status={order.status}/>
        </div>
    }},
    {Header: 'Items', accessor: order => {
        return <div>
            {order.order_items.map(item => {
                return <div key={item._id}>
                    {item.name} {item.qty}
                </div>
            })}
        </div>
    }},
    {Header: 'Total', accessor: order => {
        return <div>
            {formatRupiah(sumPrice(order.order_items) + order.delivery_fee)}
        </div>
    }},
    {Header: 'Invoice', accessor: order => {
        return <div>
            <Link to={`/invoice/${order._id}`}>
                <Button color="gray" iconBefore={<FaFileInvoiceDollar/>}>
                    Invoice
                </Button>
            </Link>
        </div>
    }}
]

export default function UserOrders(){
    let [pesanan, setPesanan] = React.useState([]);
    let [count, setCount] = React.useState(0);
    let [status, setStatus] = React.useState('idle');
    let [page, setPage] = React.useState(1);
    let [limit,] = React.useState(10);

    const fetchPesanan = React.useCallback(async () => {
        setStatus('process');

        let {data} = await getOrders({limit, page});

        if(data.error){
            setStatus('error');
            return;
        }

        setStatus('success');
        setPesanan(data.data);
       
        setCount(data.count);
    }, [page, limit]);

    React.useEffect(() => {
        fetchPesanan();
    },[fetchPesanan]);

    return (
        <LayoutOne>
            <TopBar/>
            <Text as="h3">Pesanan anda</Text>
            <br/>

            <Table
                items={pesanan}
                totalItems={count}
                columns={columns}
                onPageChange={page => setPage(page)}
                page={page}
                isLoading={status === 'process'}
            >

            </Table>
        </LayoutOne>
    )
}