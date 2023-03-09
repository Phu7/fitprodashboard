import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import router from "next/router";
import { auth, database } from "../firebaseConfig";
import {
  Member,
  MembershipPayment,
  MembershipProgram,
  Month,
  Product,
  ProductPayment,
  Template,
  Year,
} from "../types";

export async function getAllMembers() {
  const q = query(collection(database, "members"));
  const querySnapshot = await getDocs(q);

  let members: Array<Member> = [];
  querySnapshot.forEach((doc) => {
    members.push({
      docId: doc.id,
      name: {
        first_name: doc.data().name.first_name,
        last_name: doc.data().name.last_name,
      },
      email: doc.data().email,
      mobile_phone: doc.data().mobile_phone,
      joining_date: doc.data().joining_date,
      address: {
        city: doc.data().address.city,
        state: doc.data().address.state,
        country: doc.data().address.country,
      },
      membership_program: doc.data().membership_program,
      is_active: doc.data().is_active,
    });
  });

  return members;
}

export async function getAllMembershipPrograms() {
  const querySnapshot = await getDocs(
    query(collection(database, "membership_programs"), orderBy("name"))
  );
  let membershipPrograms: Array<MembershipProgram> = [];
  querySnapshot.forEach((doc) => {
    membershipPrograms.push({
      membershipProgramId: doc.id,
      name: doc.data().name,
      price: doc.data().price,
    });
  });

  return membershipPrograms;
}

export async function getMembersForMembership(membershipProgramId: string) {
  const q = query(
    collection(database, "members"),
    where("membership_program.membershipProgramId", "==", membershipProgramId)
  );
  const querySnapshot = await getDocs(q);

  let members: Array<Member> = [];
  querySnapshot.forEach((doc) => {
    members.push({
      docId: doc.id,
      name: {
        first_name: doc.data().name.first_name,
        last_name: doc.data().name.last_name,
      },
      email: doc.data().email,
      mobile_phone: doc.data().mobile_phone,
      joining_date: doc.data().joining_date,
      address: {
        city: doc.data().address.city,
        state: doc.data().address.state,
        country: doc.data().address.country,
      },
      membership_program: doc.data().membership_program,
      is_active: doc.data().is_active,
    });
  });

  return members;
}

export async function addProduct(product: Product) {
  await addDoc(collection(database, "products"), {
    name: product.name,
    price: product.price,
    total_stock: product.total_stock,
    available_stock: product.available_stock,
  });
}

export async function addMember(member: Member) {
  await addDoc(collection(database, "members"), member);
}

export async function addMembershipProgram(
  membershipProgram: MembershipProgram
) {
  await addDoc(collection(database, "membership_programs"), membershipProgram);
}

export async function addMembershipPayment(
  membershipPayment: MembershipPayment
) {
  await addDoc(collection(database, "membership_payments"), membershipPayment);
}

export async function addProductPayment(productPayment: ProductPayment) {
  await addDoc(collection(database, "product_payments"), productPayment);
}

export async function updateMember(memberId: string, member: any) {
  await updateDoc(doc(database, "members", memberId), {
    name: {
      first_name: member.name.first_name,
      last_name: member.name.last_name,
    },
    email: member.email,
    mobile_phone: member.mobile_phone,
    is_active: true,
    address: {
      city: member.address.city,
      state: member.address.state,
      country: member.address.country,
    },
    joining_date: member.joining_date,
    membership_program: member.membership_program,
  });
}

export async function updateMembershipProgram(
  membershipProgramId: string,
  membershipProgram: MembershipProgram
) {
  await updateDoc(doc(database, "membership_programs", membershipProgramId), {
    name: membershipProgram.name,
    price: membershipProgram.price,
  });
}

export async function updateProduct(productId: string, product: Product) {
  await updateDoc(doc(database, "products", productId), {
    name: product.name,
    price: product.price,
    total_stock: product.total_stock,
    available_stock: product.available_stock,
  });
}

export async function deleteMember(memberId: string) {
  await deleteDoc(doc(database, "members", memberId));
}

export async function deleteMembershipProgram(membershipProgramId: string) {
  await deleteDoc(doc(database, "membership_programs", membershipProgramId));
}

export async function deleteProduct(productId: string) {
  await deleteDoc(doc(database, "products", productId));
}

export async function deleteMembershipPayment(paymentId: string) {
  await deleteDoc(doc(database, "membership_payments", paymentId));
}

export async function deleteProductPayment(paymentId: string) {
  await deleteDoc(doc(database, "product_payments", paymentId));
}

export async function getMemberById(memberId: string) {
  const docRef = doc(database, "members", memberId);
  const docSnapshot = await getDoc(docRef);

  let member: Member;

  if (docSnapshot.exists()) {
    member = {
      docId: docSnapshot.id,
      name: {
        first_name: docSnapshot.data().name.first_name,
        last_name: docSnapshot.data().name.last_name,
      },
      email: docSnapshot.data().email,
      mobile_phone: docSnapshot.data().mobile_phone,
      joining_date: docSnapshot.data().joining_date,
      address: {
        city: docSnapshot.data().address.city,
        state: docSnapshot.data().address.state,
        country: docSnapshot.data().address.country,
      },
      membership_program: docSnapshot.data().membership_program,
      is_active: docSnapshot.data().is_active,
    };
    return member;
  }

  return null!;
}

export async function getAvailableProducts() {
  const q = query(
    collection(database, "products"),
    where("available_stock", ">", 0)
  );
  const querySnapshot = await getDocs(q);
  let products: Array<Product> = [];
  querySnapshot.forEach((doc) => {
    products.push({
      product_id: doc.id,
      name: doc.data().name,
      total_stock: doc.data().total_stock,
      available_stock: doc.data().available_stock,
      price: doc.data().price,
    });
  });

  return products;
}

export async function getUnavailableProducts() {
  const q = query(
    collection(database, "products"),
    where("available_stock", "==", 0)
  );
  const querySnapshot = await getDocs(q);
  let products: Array<Product> = [];
  querySnapshot.forEach((doc) => {
    products.push({
      product_id: doc.id,
      name: doc.data().name,
      total_stock: doc.data().total_stock,
      available_stock: doc.data().available_stock,
      price: doc.data().price,
    });
  });

  return products;
}

export async function getMessageTemplate(channel: string) {
  const q = query(
    collection(database, "templates"),
    where("channel", "==", channel)
  );
  const docRef = await getDocs(q);
  let messageTemplates: Array<Template> = [];
  docRef.forEach((template) =>
    messageTemplates.push({
      docId: template.id,
      channel: template.data().channel,
      message: template.data().message,
    })
  );

  return messageTemplates;
}

export async function getMonths() {
  const querySnapshot = await getDocs(
    query(collection(database, "months"), orderBy("value"))
  );
  let months: Array<Month> = [];
  querySnapshot.forEach((doc) => {
    months.push({
      docId: doc.id,
      name: doc.data().name,
      value: doc.data().value,
    });
  });

  return months;
}

export async function getYears() {
  const querySnapshot = await getDocs(
    query(collection(database, "years"), orderBy("value"))
  );
  let years: Array<Year> = [];
  querySnapshot.forEach((doc) => {
    years.push({
      docId: doc.id,
      value: doc.data().value,
    });
  });

  return years;
}

export async function getMembershipPayments(month: Number, year: Number) {
  const querySnapshot = await getDocs(
    query(
      collection(database, "membership_payments"),
      where("month", "==", month),
      where("year", "==", year)
    )
  );
  let payments: Array<MembershipPayment> = [];
  querySnapshot.forEach((doc) => {
    payments.push({
      docId: doc.id,
      member: doc.data().member,
      membership_program: doc.data().membership_program,
      month: doc.data().month,
      status: doc.data().status,
      year: doc.data().year,
    });
  });

  return payments;
}

export async function getProductPayments(month: Number, year: Number) {
  const querySnapshot = await getDocs(
    query(
      collection(database, "product_payments"),
      where("month", "==", month),
      where("year", "==", year)
    )
  );
  let payments: Array<ProductPayment> = [];
  querySnapshot.forEach((doc) => {
    payments.push({
      docId: doc.id,
      member: doc.data().member,
      product: doc.data().product,
      month: doc.data().month,
      year: doc.data().year,
      quantity: doc.data().quantity,
      status: doc.data().status,
      total: doc.data().total,
      due: doc.data().due,
    });
  });

  return payments;
}

export async function getProductById(productId: string) {
  const docRef = doc(database, "products", productId);
  const document = await getDoc(docRef);

  const product: Product = {
    product_id: document.id,
    name: document.data()?.name,
    total_stock: document.data()?.total_stock,
    available_stock: document.data()?.available_stock,
    price: document.data()?.price,
  };

  return product;
}

export async function getMembershipPaymentById(paymentId: string) {
  const docRef = doc(database, "membership_payments", paymentId);
  const document = await getDoc(docRef);

  let payment: MembershipPayment = {
    docId: document.id,
    member: document.data()?.member,
    membership_program: document.data()?.membership_program,
    month: document.data()?.month,
    status: document.data()?.status,
    year: document.data()?.year,
  };

  return payment;
}

export async function getProductPaymentById(paymentId: string) {
  const docRef = doc(database, "product_payments", paymentId);
  const document = await getDoc(docRef);

  let payment: ProductPayment = {
    docId: document.id,
    member: document.data()?.member,
    product: document.data()?.product,
    month: document.data()?.month,
    year: document.data()?.year,
    status: document.data()?.status,
    quantity: document.data()?.quantity,
    total: document.data()?.total,
    due: document.data()?.due,
  };

  return payment;
}

export async function updateMessageTemplate(
  templateId: string,
  message: string
) {
  await updateDoc(doc(database, "templates", templateId), {message: message});
}

export async function updateMembershipPaymentStatus(
  paymentId: string,
  status: string
) {
  await updateDoc(doc(database, "membership_payments", paymentId), {
    status: status,
  });
}

export async function updateProductPaymentAmountAndStatus(
  paymentId: string,
  payment: { due: Number; status: string }
) {
  await updateDoc(doc(database, "product_payments", paymentId), payment);
}

export async function updateProductCount(productId: string, product: Product) {
  await updateDoc(doc(database, "products", productId), {
    available_stock: product.available_stock,
  });
}
