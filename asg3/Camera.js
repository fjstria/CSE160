/* 
 * FJ Tria (@fjstria)
 * CSE160/asg3/Camera.js
 */

class Camera {
    constructor() {
        this.eye = new Vector3([0, 0.5, 3]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
        this.speed = 0.2;
   
    }
    forward(move = 0) {
        var f = new Vector3;
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(this.speed + move);
        this.eye.add(f);
        this.at.add(f);
    }
   
    back(move = 0) {
        var f = new Vector3;
        f.set(this.eye);
        f.sub(this.at);
        f.normalize();
        f.mul(this.speed + move);
        this.at.add(f);
        this.eye.add(f);
    }
    left() {
        var f = new Vector3;
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(this.speed);
        var s = Vector3.cross(this.up, f);
        this.at.add(s);
        this.eye.add(s);
    }
   
    right() {
        var f = new Vector3;
        f.set(this.eye);
        f.sub(this.at);
        f.normalize();
        f.mul(this.speed);
        var s = Vector3.cross(this.up, f);
        this.at.add(s);
        this.eye.add(s);
    }
   
    panLeft() {
        var f = new Vector3;
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setIdentity();
        rotationMatrix.setRotate(1, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let d3D = rotationMatrix.multiplyVector3(f);
        this.at = d3D.add(this.eye);
    }
   
    panRight() {
        var f = new Vector3;
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setIdentity();
        rotationMatrix.setRotate(-1, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let d3D = rotationMatrix.multiplyVector3(f);
        this.at = d3D.add(this.eye);
    }
}