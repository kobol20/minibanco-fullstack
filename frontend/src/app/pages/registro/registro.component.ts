import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from "../../services/user.service";
import { CuentaService } from "../../services/cuenta.service";
import { NgForm } from "@angular/forms";
import { User } from "../../models/user";
import { Cuenta } from 'src/app/models/cuenta';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  providers: [UserService,CuentaService],
})
export class RegistroComponent implements OnInit {


  constructor(private userservice: UserService,
              private router: Router,
              private cuentaservice: CuentaService) {}

  ngOnInit() { 
    this.userservice.selectedUser = new User();
    this.cuentaservice.selectedCuenta = new Cuenta();
  }

  registro(form?: NgForm) {
    console.log(form);
    if(form.controls['rut'].errors  ||
      form.controls['nombre'].errors ||
      form.controls['correo'].errors ||
      form.controls['pass'].errors){
        console.log("Datos vacios")
        return form.invalid == true;
    }
    this.userservice.getUsers().subscribe((res) =>{
      var user = res.find(x => x.rut === form.value.rut);
      console.log('usuario',user);
      if(null != user && user.rut === form.value.rut ){
        console.log('Usuario ya existe');
        form.value.yaexiste = true;
      }else{
        var nuevoUsuario = new User();
        nuevoUsuario.correo = form.value.correo;
        nuevoUsuario.nombre = form.value.nombre;
        nuevoUsuario.pass = form.value.pass;
        nuevoUsuario.rut = form.value.rut;
        console.log('nuevoUsuario',nuevoUsuario);
        this.userservice.postUser(nuevoUsuario).subscribe((res) =>{
          console.log(res);
          if(res){
            var nuevaCuenta = new Cuenta();
            nuevaCuenta.cuenta = form.value.rut.replace(/\./g,'');;
            nuevaCuenta.rut = form.value.rut;
            nuevaCuenta.monto = 0;
            nuevaCuenta.saldo = 0;
            this.cuentaservice.postCuenta(nuevaCuenta).subscribe((res) =>{
              console.log('nuevaCuenta',nuevaCuenta);

            });
            this.router.navigate(['/dashboard']);
          }
        });
      }
    });
  }

  checkRut(rut) {
    // Despejar Puntos
    var valor = rut.value.replace('.','');
    // Despejar Gui??n
    valor = valor.replace('-','');
    
    // Aislar Cuerpo y D??gito Verificador
    var cuerpo = valor.slice(0,-1);
    var dv = valor.slice(-1).toUpperCase();
    
    // Formatear RUN
    rut.value = cuerpo + '-'+ dv
    
    // Si no cumple con el m??nimo ej. (n.nnn.nnn)
    if(cuerpo.length < 7) { rut.setCustomValidity("RUT Incompleto"); return false;}
    
    // Calcular D??gito Verificador
    var suma = 0;
    var multiplo = 2;
    
    // Para cada d??gito del Cuerpo
    for(let i=1;i<=cuerpo.length;i++) {
    
        // Obtener su Producto con el M??ltiplo Correspondiente
        var index = multiplo * valor.charAt(cuerpo.length - i);
        
        // Sumar al Contador General
        suma = suma + index;
        
        // Consolidar M??ltiplo dentro del rango [2,7]
        if(multiplo < 7) { multiplo = multiplo + 1; } else { multiplo = 2; }
  
    }
    
    // Calcular D??gito Verificador en base al M??dulo 11
    var dvEsperado = 11 - (suma % 11);
    
    // Casos Especiales (0 y K)
    dv = (dv == 'K')?10:dv;
    dv = (dv == 0)?11:dv;
    
    // Validar que el Cuerpo coincide con su D??gito Verificador
    if(dvEsperado != dv) { rut.setCustomValidity("RUT Inv??lido"); return false; }
    
    // Si todo sale bien, eliminar errores (decretar que es v??lido)
    rut.setCustomValidity('');
}


}
