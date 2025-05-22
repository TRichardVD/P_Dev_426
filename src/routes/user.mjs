import express from 'express';
import path from 'path';
import { authReq } from '../controllers/auth.mjs';
import {
    GetUserProfile,
    renderEditProfile,
    updateProfile,
    insertList,
    dropList,
    modifyList,
    insertSiteToList,
    dropSiteFromList,
    getSiteList,
    getSiteLists,
} from '../controllers/user.mjs';
import methodOverride from 'method-override';
import multer from 'multer';
import User from '../models/user.mjs';

const userRouter = express();
userRouter.use(methodOverride('_method'));
userRouter.set('views', path.resolve('src/views'));

const upload = multer({ dest: 'images/backgrounds/' });

userRouter.get('/profile', authReq, GetUserProfile);

// Route pour afficher la page d'édition du profil
userRouter.get('/edit-profile', authReq, renderEditProfile);

// Route pour mettre à jour les données du profil
userRouter.post('/edit-profile', authReq, updateProfile);

userRouter.post('/list', authReq, insertList);
userRouter.delete('/list/:listId/delete', authReq, dropList);
userRouter.put('/list/:listId', modifyList);
userRouter.post('/list/:listId/site/:siteId', authReq, insertSiteToList);
userRouter.delete('/list/:listId/site/:siteId', authReq, dropSiteFromList);
userRouter.get('/list', authReq, getSiteLists);
userRouter.get('/list/:listId', authReq, getSiteList);
userRouter.get('/admin', authReq, GetUserProfile); // Accès au panneau admin via /user/admin
userRouter.post(
    '/admin/update-home-image',
    authReq,
    upload.single('mainImage'),
    async (req, res) => {
        if (!req.user || req.user.role !== 'admin')
            return res.status(403).send('Accès refusé');
        // Remplacer l'image principale
        const fs = await import('fs');
        const path = await import('path');
        const dest = path.resolve(
            'resources/images/backgrounds/homepage-bg.jpg'
        );
        fs.copyFileSync(req.file.path, dest);
        fs.unlinkSync(req.file.path);
        res.redirect('/user/admin');
    }
);
userRouter.post('/admin/promote/:id', authReq, async (req, res) => {
    if (!req.user || req.user.role !== 'admin')
        return res.status(403).send('Accès refusé');
    await User.findByIdAndUpdate(req.params.id, { role: 'admin' });
    res.redirect('/user/admin');
});
userRouter.post('/admin/delete/:id', authReq, async (req, res) => {
    if (!req.user || req.user.role !== 'admin')
        return res.status(403).send('Accès refusé');
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/user/admin');
});

export { userRouter };
