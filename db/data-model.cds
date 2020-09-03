namespace northwind.db;

using { Currency, managed, cuid } from '@sap/cds/common';
type status :  String enum { pending; ordered; shipped; delivered; } 

entity Pictures {
  key ID : UUID;
  @Core.MediaType: mediaType
  content : LargeBinary;
  @Core.IsMediaType: true
  mediaType : String;
  filename : String;
 
}

entity Image {
    key imageID : UUID;
    @Core.MediaType: 'image/png'
    picture : LargeBinary;
}

//northwind.db-Customer.csv
entity Customer : managed {
    key customerID : String;
    CompanyName : String(40) not null;
    dateOfBirth  : Date;
    contactName : String;
    address : Composition of many Address on address.parent=$self;
}

entity Address : cuid, managed {
  parent : Association to one Customer;
  supplier : Association to Supplier;
  street : String(60) ;
  city : String(60) ;
  postalcode : String(10);
  phone : localized String(24);
};

//northwind.db-Products.csv
entity Products:  managed {
    key productID : Integer;
    productName : String(40);
    describtion : String(100);
    quantityPerUnit : String(20);
    unitPrice : Decimal(16, 4);
    unitsInStock : Integer not null;
    discontinued : Boolean;
    supplier : Composition of Supplier { supplierID };
    category : Composition of Category { categoryID }; 
}

//northwind.db-Supplier.csv
entity Supplier : managed {
    key supplierID: Integer;
    companyName : localized String(40) not null;
    contactName : localized String(30);
    contactTitle : localized String(30);
    address      : Composition of many Address on address.supplier=$self;
    products : Composition of many Products on products.supplier = $self;
}

//northwind.db-Category.csv
entity Category : managed {
    key categoryID : Integer;
    categoryName : String(45) not null;
    description : String(60);
    // imageUrl  : String @Core.IsURL @Core.MediaType: imageType;
    @Core.MediaType: 'image/png'
    picture : LargeBinary;
    products : Composition of many Products on products.category = $self;
}

//northwind.db-Employee.csv
entity Employee : managed {
    key employeeID : Integer;
    LastName : localized String(20) not null;
    FirstName : localized String(20) not null;
    dateOfBirth : Date;
    @Core.MediaType: 'image/png'
    photo : LargeBinary;
} 

entity cartItems: cuid {
    products : Composition of Products;
    customers : Composition of Customer;
    quantity : Integer;
    shipVia : String(2) enum {
        ship = 'S' @( title: 'Ship');
        train   = 'T' @( title: 'Train');
        truck  = 'TR' @( title: 'Truck');
        air = 'A' @( title: 'Aircraft');
    } default 'TR';
    netamount : Integer default 0;
}

//northwind.db-Orders.csv
entity Orders : managed, cuid {
    OrderNo : String(10) @title:'Order Number'; 
    discount : String(3);
    orderDate : Date not null;
    requiredDate : Date not null;   
    shippedDate : Date ;
    deliveredDate : DateTime;
    price : Integer;
    currency: Currency;
    order_status : status default 'pending';
    ShippingAddress : Composition of one OrderShippingAddress;
    customer : Composition of Customer;
    employee : Composition of Employee;
    items : Composition of many OrderItems on items.parent = $self;
}

//northwind.db-OrderShippingAddress.csv 
entity OrderShippingAddress : cuid, managed {
  parent : Association to Orders ;
  street : String(60) @( title: 'Street', );
  city : String(60) @( title: 'City', );
  postalcode : String(10);
  phone : localized String(24);
};

//northwind.db-OrderItems.csv 
entity OrderItems : cuid {
    parent : Association to Orders;
    products : Composition of Products;
    customer : Composition of Customer;
    quantity : Integer;
    shipVia : String(2) enum {
        ship = 'S' @( title: 'Ship');
        train   = 'T' @( title: 'Train');
        truck  = 'TR' @( title: 'Truck');
        air = 'A' @( title: 'Aircraft');
    };
    netamount: Integer not null;
    currency: Currency;
}