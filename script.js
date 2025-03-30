const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 600;
canvas.height = 600;

class Ball {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.dx = (Math.random() - 0.5) * 24; // 3x faster horizontal velocity
        this.dy = (Math.random() - 0.5) * 24; // 3x faster vertical velocity
        this.deformation = 0; // Current deformation amount
        this.deformationDirection = { x: 0, y: 0 }; // Direction of deformation
        this.recoverySpeed = 0.05; // Slower recovery for more visible effect
    }

    draw() {
        ctx.beginPath();
        
        // Calculate squished radius based on deformation
        const squishAmount = 1 - (this.deformation * 0.5); // Increased to 50% squish
        const radiusX = this.radius * (1 + this.deformation * 0.4); // Increased expansion in collision direction
        const radiusY = this.radius * squishAmount; // Squish perpendicular to collision
        
        // Draw squished circle
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.deformationDirection.y, this.deformationDirection.x));
        ctx.scale(radiusX / this.radius, radiusY / this.radius);
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.restore();
        
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update(balls) {
        // Bounce off walls
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
            this.deformation = 0.5; // Increased deformation on wall collision
            this.deformationDirection = { x: this.dx > 0 ? -1 : 1, y: 0 };
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy = -this.dy;
            this.deformation = 0.5; // Increased deformation on wall collision
            this.deformationDirection = { x: 0, y: this.dy > 0 ? -1 : 1 };
        }

        // Update position
        this.x += this.dx;
        this.y += this.dy;

        // Check collision with other balls
        balls.forEach(ball => {
            if (ball === this) return;

            const dx = ball.x - this.x;
            const dy = ball.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius + ball.radius) {
                // Collision detected - calculate new velocities
                const angle = Math.atan2(dy, dx);
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);

                // Rotate velocities
                const vx1 = this.dx * cos + this.dy * sin;
                const vy1 = this.dy * cos - this.dx * sin;
                const vx2 = ball.dx * cos + ball.dy * sin;
                const vy2 = ball.dy * cos - ball.dx * sin;

                // Elastic collision
                const finalVx1 = vx2;
                const finalVx2 = vx1;

                // Rotate velocities back
                this.dx = finalVx1 * cos - vy1 * sin;
                this.dy = vy1 * cos + finalVx1 * sin;
                ball.dx = finalVx2 * cos - vy2 * sin;
                ball.dy = vy2 * cos + finalVx2 * sin;

                // Move balls apart to prevent sticking
                const overlap = (this.radius + ball.radius - distance) / 2;
                this.x -= overlap * cos;
                this.y -= overlap * sin;
                ball.x += overlap * cos;
                ball.y += overlap * sin;

                // Add deformation on collision
                this.deformation = 0.5; // Increased deformation
                this.deformationDirection = { x: -cos, y: -sin };
                ball.deformation = 0.5; // Increased deformation
                ball.deformationDirection = { x: cos, y: sin };
            }
        });

        // Gradually recover from deformation
        this.deformation = Math.max(0, this.deformation - this.recoverySpeed);
    }
}

// Create balls
const balls = [];
const colors = ['red', 'blue', 'green', 'white'];
const radius = 20;

// Create 2 balls of each color
colors.forEach(color => {
    for (let i = 0; i < 2; i++) {
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;
        balls.push(new Ball(x, y, radius, color));
    }
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    balls.forEach(ball => {
        ball.update(balls);
        ball.draw();
    });

    requestAnimationFrame(animate);
}

animate(); 