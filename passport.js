const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
require('dotenv').config();
const passport=require('passport');
const User = require('./model/user.model');

// cấu hình passport để cho phép người dùng đăng nhập thông qua tài khoản Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // nơi Google chuyển hướng sau khi xác thực thành công
    callbackURL: "https://food-project-nu-opal.vercel.app/auth/google/callback"
  },
    async (accessToken, refreshToken, profile, cb) =>{
        // thêm user ở đây 
        if(profile?.id){
            const email=profile.emails[0]?.value
            const existUser=await User.findOne({
                googleId:profile.id,
            })
            if(!existUser){
                const user=new User({
                    googleId:profile.id,
                    email:email,
                    fullname:profile.displayName,
                    typeLogin:profile.provider,
                    avatar:profile.photos[0].value,
                })
                await user.save()
            }
            else{
                //cập nhật token nếu tạo 1 router login-success
            }
        }
        return cb(null, profile);//để null là luôn thành công là luôn gọi lại /auth/google/callback
    }
));


