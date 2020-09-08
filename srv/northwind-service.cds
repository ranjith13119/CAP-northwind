using {northwind.db as db} from '../db/data-model';

service Northwind @(requires: ['authenticated-user']) {
	@readonly entity Pictures as projection on db.Pictures;
	entity Image as projection on db.Image;
    entity Customers as projection on db.Customer { *  }  ;  
    entity Suppliers as projection on db.Supplier { * } ; 
    entity Employees as projection on db.Employee { * } ;
    entity Categories as projection on db.Category { * } ;
    entity Address as projection on db.Address { * } ; 
    entity OrderShippingAddress as projection on db.OrderShippingAddress; 
    entity Products as projection on db.Products { * } ;
    entity cartItems as projection on db.cartItems;
    entity Order_items as projection on db.OrderItems { * } ;
    entity Orders as projection on db.Orders { * };
    action cancelOrder(ID : Orders.ID, reason:String);
    action UpdateShippingdetails ( custID : Customers.customerID, ship_mode : String);
    function fnTestCal( custID : String) returns String;
} 

// service Northwind  @(requires: ['authenticated-user']) {
//     entity Customers @(restrict: [ { grant: ['READ', 'UPDATE', 'DELETE'], to: 'customer', where: 'customerID = $user' }, 
//                                   { grant: ['*'], to: 'Admin'}]) as projection on db.Customer { *  }  ;  
//     entity Suppliers @(restrict: [ { grant: ['READ'], to: 'customer'}, 
//                                   { grant: ['*'], to: 'Admin'} ]) as projection on db.Supplier { * } ; 
//     entity Employees @(restrict: [ { grant: ['READ'], to: 'customer'}, 
//                                   { grant: ['*'], to: 'Admin'}]) as projection on db.Employee { * } ;
//     entity Categories @(restrict: [{ grant: ['READ'], to: 'customer'},
//                                   { grant: ['*'], to: 'Admin'}]) as projection on db.Category { * } ;
//     entity Address @(restrict: [ { grant: ['*'], to: 'customer', where: 'parent_customerID = $user'}]) as projection on db.Address { * } ; 
//     entity OrderShippingAddress @(restrict: [ { grant: ['READ'], to: 'customer'}]) as projection on db.OrderShippingAddress; 
//     entity Products @(restrict: [ { grant: ['READ'], to: 'customer'}, 
//                                   { grant: ['*'], to: 'Admin'}]) as projection on db.Products { * } ;
//     entity cartItems @(restrict: [ { grant: ['READ','DELETE', 'UPDATE'], to: 'customer',  where: 'customers_customerID = $user' },
//                                   {grant: ['CREATE', 'WRITE'], to: 'customer'}]) as projection on db.cartItems;
//     entity Order_items @(restrict: [ { grant: ['READ','DELETE', 'UPDATE'], to: 'customer' },
//                                      {grant: ['CREATE', 'WRITE'], to: 'customer'}]) as projection on db.OrderItems { * } ;
//     entity Orders @(restrict: [ { grant: ['READ','DELETE', 'UPDATE'], to: 'customer',  where: 'customer_customerID = $user' },
//                                  {grant: ['CREATE', 'WRITE'], to: 'customer'}]) as projection on db.Orders { * };

//     action cancelOrder(ID : Orders.ID, reason:String);
//     action UpdateShippingdetails ( custID : Customers.customerID, ship_mode : String);
//     function fnTestCal( custID : String) returns String;
// } 