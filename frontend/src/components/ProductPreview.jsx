import React from 'react';
import './ProductPreview.css';

const ProductPreview = ({ type, color, text, image }) => {
    const renderPreview = () => {
        const lowerType = type?.toLowerCase() || '';
        
        if (lowerType.includes('mug')) {
            return (
                <div className="preview-mug-container">
                    <div className="mug-handle"></div>
                    <div className="mug-body" style={{ backgroundColor: color || '#ffffff' }}>
                        {image && <img src={image} alt="design" className="preview-overlay-img" />}
                        <div className="mug-text">{text || 'Your Text Here'}</div>
                    </div>
                </div>
            );
        } else if (lowerType.includes('shirt') || lowerType.includes('t-shirt')) {
            return (
                <div className="preview-shirt-container">
                    <div className="shirt-body" style={{ backgroundColor: color || '#ffffff' }}>
                        <div className="shirt-neck"></div>
                        <div className="shirt-sleeves left"></div>
                        <div className="shirt-sleeves right"></div>
                        {image && <img src={image} alt="design" className="preview-overlay-img shirt-img" />}
                        <div className="shirt-text">{text || 'Your Text Here'}</div>
                    </div>
                </div>
            );
        } else if (lowerType.includes('frame')) {
            return (
                <div className="preview-frame-container">
                    <div className="frame-outer" style={{ borderColor: color || '#333' }}>
                        <div className="frame-inner">
                            {image && <img src={image} alt="design" className="preview-overlay-img frame-img" />}
                            <div className="frame-text">{text || 'Your Text Here'}</div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="preview-generic" style={{ backgroundColor: color || '#f0f0f0' }}>
                    <p>{text || 'Select a product to preview'}</p>
                </div>
            );
        }
    };

    return (
        <div className="product-preview-wrapper">
            <div className="preview-canvas">
                {renderPreview()}
            </div>
        </div>
    );
};

export default ProductPreview;
