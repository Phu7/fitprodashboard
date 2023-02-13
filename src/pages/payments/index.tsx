import { useState } from "react";
import MembershipFeePayment from "./membershipfeepayment";
import ProductPayment from "./productpayment";

function Payments() {
  const [paymentType, setPaymentType] = useState<number>(1);
  
  const updatePaymentType = (value:number) => {
    setPaymentType(value);
  }

  return (
    paymentType === 1 ?
    <MembershipFeePayment updatePaymentType={updatePaymentType}/> :
    <ProductPayment updatePaymentType={updatePaymentType}/>
  )
}

export default Payments;
