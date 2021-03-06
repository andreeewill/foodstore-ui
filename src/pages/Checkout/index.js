import * as React from "react";
import {Link, useHistory, Redirect} from 'react-router-dom';
//ui
import { LayoutOne, Text, Steps, Table, Button, Responsive } from "upkit";
//component
import TopBar from "../../components/TopBar";
//icons
import FaCartPlus from "@meronex/icons/fa/FaCartPlus";
import FaAddressCard from "@meronex/icons/fa/FaAddressCard";
import FaInfoCircle from "@meronex/icons/fa/FaInfoCircle";
import FaArrowRight from '@meronex/icons/fa/FaArrowRight';
import FaArrowLeft from '@meronex/icons/fa/FaArrowLeft';
import FaRegCheckCircle from '@meronex/icons/fa/FaRegCheckCircle';
//redux
import {useSelector, useDispatch} from 'react-redux';
import { clearItems } from "../../features/Cart/action";
//misc
import { config } from '../../config';
import {formatRupiah} from '../../utils/format-rupiah';
import {sumPrice} from '../../utils/sum-price';
//hooks
import { useAddressData } from "../../hooks/address";
//api
import {createOrder} from '../../api/order';

const IconWrapper = ({ children }) => {
  return <div className="text-3xl flex justify-center">{children}</div>;
};

const steps = [
  {
    label: "Item",
    icon: (
      <IconWrapper>
        <FaCartPlus />
      </IconWrapper>
    ),
  },
  {
    label: "Alamat",
    icon: (
      <IconWrapper>
        <FaAddressCard />
      </IconWrapper>
    ),
  },
  {
    label: "Konfirmasi",
    icon: (
      <IconWrapper>
        <FaInfoCircle />
      </IconWrapper>
    ),
  },
];

const columns = [
    {
        Header: 'Nama produk',
        accessor: item => <div className="flex items-center">
            <img src={`${config.api_host}/upload/${item.image_url}`} width={48} alt={item.name} />
            {item.name}
        </div>
    },
    {
        Header: 'Jumlah',
        accessor: 'qty'
    },
    {
        Header: 'Harga satuan',
        id: 'price',
        accessor: item => <span>@ {formatRupiah(item.price)}</span>
    },
    {
        Header: 'Harga total',
        id: 'subtotal',
        accessor: item => {
            return <div>
                {formatRupiah(item.price * item.qty)}
            </div>
        }

    }
];

const addressColumns = [
  {
    Header: 'Nama alamat',
    accessor: alamat => {
      return <div>
        {alamat.nama}
        <br/>
        <small>{alamat.provinsi}, {alamat.kabupaten}, {alamat.kecamatan}, {alamat.kelurahan}
        <br/>
        {alamat.detail}
        </small>       
      </div>
    }
  }
]

export default function Checkout() {
  let [activeStep, setActiveStep] = React.useState(0);
  //cart (menu 1)
  let cart = useSelector(state => state.cart);
  // address (menu 2)
  let {data, status, limit, page, count, setPage} = useAddressData();
  let [selectedAddress, setSelectedAddress] = React.useState(null);
  //redirect
  let history = useHistory();
  let dispatch = useDispatch();

  //create order
  async function handleCreateOrder(){
    let payload = {
      delivery_fee: config.global_ongkir,
      delivery_address: selectedAddress._id
    }

    let {data} = await createOrder(payload);
    //check error
    if(data?.error){
      console.log(JSON.stringify(data));
      return;
    }
    //no error
    history.push(`/invoice/${data._id}`);
    //clear cart on redux
    dispatch(clearItems());
  }

  if(!cart.length){
    return <Redirect to="/" />
  }

  return (
    <LayoutOne>
      <TopBar />
      <Text as="h3">Checkout</Text>
        <br/>
      <Steps steps={steps} active={activeStep} />
      
      {/* active menu cart*/}
      {activeStep === 0 ? 
      <div>
          <br/><br/>
          <Table
            items={cart}
            columns={columns}
            perPage={cart.length}
            showPagination={false}
          />
          <br/>
          <div className="text-right">
            <Text as="h4">
                Subtotal: {formatRupiah(sumPrice(cart))}
            </Text>
          </div>
          <br/>
          <Button
            onClick={_ => setActiveStep(activeStep+1)}
            color="red"
            iconAfter={<FaArrowRight/>}
          >Selanjutnya</Button>
      </div> : null}


      {/* active menu address */}
      {activeStep === 1 ? 
      <div>
        <br/><br/>
        <Table
          items={data}
          columns={addressColumns}
          perPage={limit}
          page={page}
          onPageChange={page => setPage(page)}
          totalItems={count}
          isLoading={status === 'process'}
          selectable
          primaryField={'_id'}
          selectedRow={selectedAddress}
          onSelectRow={item => setSelectedAddress(item)}
        />
        {!data.length && status === 'success'? 
          <div className="text-center my-10">
            <Link to="alamat-pengiriman/tambah">
              Kamu belum memiliki alamat pengiriman
              <br/><br/>
              <Button>Tambah alamat</Button>
            </Link>
          </div>: null
        }
        <br/><br/>
        <Responsive desktop={2} tablet={2} mobile={2}>
          <div>
            <Button
              onClick={_ => setActiveStep(activeStep-1)}
              color="gray"
              iconBefore={<FaArrowLeft/>}
            >
              Sebelumnya
            </Button>
          </div>
          <div className="text-right">
            <Button
              onClick={_ => setActiveStep(activeStep+1)}
              disabled={!selectedAddress}
              iconAfter={<FaArrowRight/>}
            >
              Selanjutnya
            </Button>
          </div>
        </Responsive>
      </div>
      : null}

      {/* active menu konfirmasi */}
      {activeStep === 2 ?
      <div>
        <br/><br/>
        <Table     
          columns={[
            {
              Header: '',
              accessor: 'label'
            },
            {
              Header: '',
              accessor: 'value'
            }
          ]}    

          items={[
            {label: 'Alamat', value: <div>
              {selectedAddress.nama}<br/>
              {selectedAddress.provinsi}, {selectedAddress.kabupaten}, {selectedAddress.kecamatan}, {selectedAddress.kelurahan} <br/>
              {selectedAddress.detail}
            </div>},
            {label: 'Subtotal', value: formatRupiah(sumPrice(cart))},
            {label: 'Ongkir', value: formatRupiah(config.global_ongkir)},
            {label: 'Total', value: <b>{formatRupiah(sumPrice(cart) + parseInt(config.global_ongkir))}</b>}
          ]}
          showPagination={false}
        />
        <br/><br/>
        <Responsive desktop={2} tablet={2} mobile={2}>
          <div>
            <Button
              onClick={_ => setActiveStep(activeStep-1)}
              color="gray"
              iconBefore={<FaArrowRight/>}
            >
              Sebelumnya
            </Button>
          </div>
          <div className="text-right">
            <Button
              onClick={handleCreateOrder}
              color="red"
              size="large"
              iconBefore={<FaRegCheckCircle/>}
            >
              Bayar
            </Button>
          </div>
        </Responsive>
      </div>
      : null}
    </LayoutOne>
  );
}
